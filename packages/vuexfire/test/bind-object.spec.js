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
      items: null
    },
    getters: {
      items (state) { return state.items }
    },
    actions: {
      setItemsRef (context, ref) {
        bind('items', ref)
      }
    },
    mutations: {
      ...mutations
    },
    plugins: [VuexFire]
  })

  const bind = generateBind(t.context.store.commit)

  // Create a fresh ref for the test
  const ref = root.push({
    test: null
  })
  root.flush()
  t.context.ref = ref
})

test('pass', t => {
  const items = {
    foo: 1,
    bar: 2,
    '.key': t.context.ref.key
  }
  t.context.store.dispatch('setItemsRef', t.context.ref)
  t.context.ref.set(items)
  t.context.ref.flush()

  t.is(t.context.ref.getData().foo, 1)
  t.deepEqual(t.context.store.state.items, items)
  t.context.ref.child('foo').set(3)
  t.context.ref.flush()
  t.deepEqual(t.context.store.state.items.foo, 3)
})
