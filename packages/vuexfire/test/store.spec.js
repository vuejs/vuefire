import test from 'ava'
import Vue from 'vue'
import Vuex from 'vuex'

import {
  firebaseMutations,
  firebaseAction,
} from '../src'

test.before(t => {
  Vue.use(Vuex)
})

test.beforeEach(t => {
  t.context.store = new Vuex.Store({
    state: {
      options: null,
    },
    actions: {
      give: firebaseAction(() => true),
    },
    mutations: firebaseMutations,
  })
})

test('propagates the returns', async (t) => {
  t.is(await t.context.store.dispatch('give'), true)
})
