import test from 'ava'
import Vue from 'vue'
import Vuex from 'vuex'
import {
  createRef,
  createFirebaseApp,
} from './helpers/firebase.js'

import {
  firebaseMutations,
  firebaseAction,
} from '../src'

const firebaseApp = createFirebaseApp()

test.before(t => {
  Vue.use(Vuex)
})

test.beforeEach(async (t) => {
  t.context.store = new Vuex.Store({
    state: {
      items: [],
    },
    actions: {
      setItemsRef: firebaseAction(({ bindFirebaseRef }, ref) => {
        bindFirebaseRef('items', ref)
      }),
      unbindItemsRef: firebaseAction(({ unbindFirebaseRef }) => {
        unbindFirebaseRef('items')
      }),
      bindsWithCallback: firebaseAction(
        ({ bindFirebaseRef }, { ref, readyCallback, wait = false }) => {
          bindFirebaseRef('items', ref, { readyCallback, wait })
        }
      ),
    },
    mutations: firebaseMutations,
  })

  // Create a fresh ref for the test
  const ref = await createRef(firebaseApp)
  t.context.ref = ref
  await ref.set({})
})

test('binds a subset of records when using limit queries', async (t) => {
  t.context.store.dispatch('setItemsRef', t.context.ref.limitToLast(2))
  await t.context.ref.set({
    a: 1,
    b: 2,
    c: 3,
  })
  t.deepEqual(t.context.store.state.items, [
    { '.key': 'b', '.value': 2 },
    { '.key': 'c', '.value': 3 },
  ])
})

test('removes records when outside of limit', async (t) => {
  t.context.store.dispatch('setItemsRef', t.context.ref.limitToLast(2))
  await t.context.ref.set({
    a: 1,
    b: 2,
    c: 3,
  })
  await t.context.ref.child('d').set(4)
  t.deepEqual(t.context.store.state.items, [
    { '.key': 'c', '.value': 3 },
    { '.key': 'd', '.value': 4 },
  ])
})

test('add existing record when another within the limit is removed', async (t) => {
  t.context.store.dispatch('setItemsRef', t.context.ref.limitToLast(2))
  await t.context.ref.set({
    a: 1,
    b: 2,
    c: 3,
  })
  await t.context.ref.child('c').remove()
  t.deepEqual(t.context.store.state.items, [
    { '.key': 'a', '.value': 1 },
    { '.key': 'b', '.value': 2 },
  ])
})

test('order records properly', async (t) => {
  t.context.store.dispatch('setItemsRef', t.context.ref.orderByValue())
  await t.context.ref.set({
    a: 2,
    b: 1,
    c: 3,
  })
  t.deepEqual(t.context.store.state.items, [
    { '.key': 'b', '.value': 1 },
    { '.key': 'a', '.value': 2 },
    { '.key': 'c', '.value': 3 },
  ])
})

test('moves a record when the order changes', async (t) => {
  t.context.store.dispatch('setItemsRef', t.context.ref.orderByValue())
  await t.context.ref.set({
    a: 1,
    b: 2,
    c: 3,
  })
  await t.context.ref.child('a').set(4)
  t.deepEqual(t.context.store.state.items, [
    { '.key': 'b', '.value': 2 },
    { '.key': 'c', '.value': 3 },
    { '.key': 'a', '.value': 4 },
  ])
  await t.context.ref.child('a').set(1)
  t.deepEqual(t.context.store.state.items, [
    { '.key': 'a', '.value': 1 },
    { '.key': 'b', '.value': 2 },
    { '.key': 'c', '.value': 3 },
  ])
  await t.context.ref.child('a').set(2.5)
  t.deepEqual(t.context.store.state.items, [
    { '.key': 'b', '.value': 2 },
    { '.key': 'a', '.value': 2.5 },
    { '.key': 'c', '.value': 3 },
  ])
})

test.cb('readyCallback', t => {
  const foo = t.context.ref.child('foo')
  t.plan(1)
  const readyCallback = res => {
    t.deepEqual(res.val(), { bar: 'bar' })
    t.end()
  }
  t.context.store.dispatch('bindsWithCallback', { ref: foo, readyCallback })
  foo.child('bar').set('bar')
})

test.cb('waits for the whole array to be synced', (t) => {
  const first = t.context.ref.child('page_1')
  const second = t.context.ref.child('page_2')

  t.context.store.dispatch('setItemsRef', first)
  t.deepEqual(t.context.store.state.items, [])
  first.child('foo').set('item 1').then(() => {
    t.deepEqual(t.context.store.state.items, [{'.key': 'foo', '.value': 'item 1'}])

    const readyCallback = () => {
      t.deepEqual(t.context.store.state.items, [])
      second.child('foo').set('item 2').then(() => {
        t.deepEqual(t.context.store.state.items, [{'.key': 'foo', '.value': 'item 2'}])
        t.end()
      })
    }

    t.context.store.dispatch('bindsWithCallback', {
      ref: second,
      readyCallback,
      wait: true,
    })
    t.deepEqual(t.context.store.state.items, [{'.key': 'foo', '.value': 'item 1'}])
  })
})
