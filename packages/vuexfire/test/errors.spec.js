import test from 'ava'
import Vue from 'vue'
import Vuex from 'vuex'
import { MockFirebase } from 'firebase-mock'

import VuexFire, {
  mutations,
  generateBind
} from '../src'

const root = new MockFirebase()
const invalidFirebaseRefs = [null, undefined, true, false, [], 0, 5, '', 'a', ['hi', 1]]

test.before(t => {
  Vue.use(Vuex)
})

test.beforeEach(t => {
  t.context.store = new Vuex.Store({
    state: {
      options: null
    },
    mutations,
    plugins: [VuexFire]
  })

  const { bind, unbind } = generateBind(t.context.store)
  t.context.bind = bind
  t.context.unbind = unbind

  // Create a fresh ref for the test
  const ref = root.push({})
  root.flush()
  t.context.ref = ref
})

test('invalid firebase refs', t => {
  invalidFirebaseRefs.forEach(ref => {
    const err = t.throws(() => t.context.bind('foo', ref))
    t.is(err.message, 'VuexFire: invalid Firebase binding source.')
  })
})

test('bind non existing key', t => {
  const err = t.throws(() => t.context.bind('foo', t.context.ref))
  t.is(err.message, `VuexFire: cannot bind undefined property 'foo'. Define it on the state first.`)
})

test('unbind non existing key', t => {
  const err = t.throws(() => t.context.unbind('options'))
  t.is(err.message, `VuexFire: cannot unbind 'options' because it wasn't bound.`)
})

test('unbind twice', t => {
  t.notThrows(() => {
    t.context.bind('options', t.context.ref)
    t.context.unbind('options')
  })
  const err = t.throws(() => {
    t.context.unbind('options')
  })
  t.is(err.message, `VuexFire: cannot unbind 'options' because it wasn't bound.`)
})
