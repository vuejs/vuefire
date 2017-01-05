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
    modules: {
      todos: {
        state: {
          items: [],
          options: null
        },
        actions: {
          setItemsRef (context, ref) {
            bind('items', ref)
          },
          setOptionsRef (context, ref) {
            bind('options', ref)
          },
          unbindOptionsRef (context) {
            unbind('options')
          },
          unbindItemsRef (context) {
            unbind('items')
          }
        },
        mutations: {
          ...mutations
        }
      }
    },
    plugins: [VuexFire]
  })

  const { bind, unbind } = generateBind(t.context.store._modules.get(['todos']))

  // Create a fresh ref for the test
  const ref = root.push({})
  root.flush()
  t.context.ref = ref
})

test('binds an array to a module', t => {
  t.context.store.dispatch('setItemsRef', t.context.ref)
  t.context.ref.set({
    first: { index: 0 },
    second: { index: 1 },
    third: { index: 2 }
  })
  t.context.ref.flush()

  t.deepEqual(t.context.store.state.todos.items, [
    { '.key': 'first', index: 0 },
    { '.key': 'second', index: 1 },
    { '.key': 'third', index: 2 }
  ])
  t.context.ref.child('first').child('index').set(3)
  t.context.ref.flush()
  t.deepEqual(t.context.store.state.todos.items[0].index, 3)
})
