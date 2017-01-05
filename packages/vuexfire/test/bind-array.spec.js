import test from 'ava'
import Vue from 'vue'
import Vuex from 'vuex'
import { MockFirebase } from 'firebase-mock'

import VuexFire, {
  mutations,
  generateBind
} from '../src'

const root = new MockFirebase()

test.before(t => {
  Vue.use(Vuex)
})

test.beforeEach(t => {
  t.context.store = new Vuex.Store({
    state: {
      items: []
    },
    actions: {
      setItemsRef (context, ref) {
        bind('items', ref)
      },
      unbindItemsRef (context) {
        unbind('items')
      }
    },
    mutations: {
      ...mutations
    },
    plugins: [VuexFire]
  })

  const { bind, unbind } = generateBind(t.context.store)

  // Create a fresh ref for the test
  const ref = root.push({})
  root.flush()
  t.context.ref = ref
})

test('binds to an array', t => {
  t.context.store.dispatch('setItemsRef', t.context.ref)
  t.context.ref.set({
    first: { index: 0 },
    second: { index: 1 },
    third: { index: 2 }
  })
  t.context.ref.flush()

  t.deepEqual(t.context.store.state.items, [
    { '.key': 'first', index: 0 },
    { '.key': 'second', index: 1 },
    { '.key': 'third', index: 2 }
  ])
  t.context.ref.child('first').child('index').set(3)
  t.context.ref.flush()
  t.deepEqual(t.context.store.state.items[0].index, 3)
})

test.skip('binds to a reference array with no data', t => {
  t.context.store.dispatch('setOptionsRef', t.context.ref.child('foo'))
  t.context.ref.flush()

  t.deepEqual(t.context.store.state.options, { '.key': 'foo', '.value': null })
})

test.skip('binds multiple array references at the same time', t => {
  const foo = t.context.ref.child('foo')
  const bar = t.context.ref.child('bar')
  t.context.store.dispatch('setOptionsRef', foo)
  t.context.store.dispatch('setPrimitiveRef', bar)
  foo.set('foo')
  bar.set('bar')
  t.context.ref.flush()

  t.deepEqual(t.context.store.state.options, {'.key': 'foo', '.value': 'foo'})
  t.deepEqual(t.context.store.state.primitive, {'.key': 'bar', '.value': 'bar'})
})

test.skip('unbinds old array reference when binding a new one', t => {
  const foo = t.context.ref.child('foo')
  const bar = t.context.ref.child('bar')
  t.context.store.dispatch('setOptionsRef', foo)

  foo.set('foo')
  t.context.ref.flush()
  t.deepEqual(t.context.store.state.options, {'.key': 'foo', '.value': 'foo'})

  t.context.store.dispatch('setOptionsRef', bar)
  bar.set('bar')
  t.context.ref.flush()
  t.deepEqual(t.context.store.state.options, {'.key': 'bar', '.value': 'bar'})

  foo.set('foo 2')
  t.context.ref.flush()
  t.deepEqual(t.context.store.state.options, {'.key': 'bar', '.value': 'bar'})
})

test.skip('unbinds an array reference', t => {
  const foo = t.context.ref.child('foo')
  t.context.store.dispatch('setOptionsRef', foo)

  foo.set('foo')
  t.context.ref.flush()
  t.deepEqual(t.context.store.state.options, {'.key': 'foo', '.value': 'foo'})

  t.context.store.dispatch('unbindOptionsRef')
  foo.set('foo 2')
  t.context.ref.flush()
  t.deepEqual(t.context.store.state.options, {'.key': 'foo', '.value': 'foo'})
})
