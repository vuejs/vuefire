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
      options: null,
      primitive: null
    },
    getters: {
      options (state) { return state.options }
    },
    actions: {
      setPrimitiveRef (context, ref) {
        bind('primitive', ref)
      },
      setOptionsRef (context, ref) {
        bind('options', ref)
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

test('binds to an object', t => {
  const options = {
    foo: 1,
    bar: 2,
    '.key': t.context.ref.key
  }
  t.context.store.dispatch('setOptionsRef', t.context.ref)
  t.context.ref.set(options)
  t.context.ref.flush()

  t.is(t.context.ref.getData().foo, 1)
  t.deepEqual(t.context.store.state.options, options)
  t.context.ref.child('foo').set(3)
  t.context.ref.flush()
  t.deepEqual(t.context.store.state.options.foo, 3)
})

test('binds to a primitive', t => {
  const primitive = 2
  t.context.store.dispatch('setPrimitiveRef', t.context.ref)
  t.context.ref.set(primitive)
  t.context.ref.flush()

  t.is(t.context.store.state.primitive['.value'], 2)
  t.is(t.context.store.state.primitive['.key'], t.context.ref.key)
  t.context.ref.set('foo')
  t.context.ref.flush()
  t.is(t.context.store.state.primitive['.value'], 'foo')
  t.is(t.context.store.state.primitive['.key'], t.context.ref.key)
})

test('binds to a reference with no data', t => {
  t.context.store.dispatch('setOptionsRef', t.context.ref.child('foo'))
  t.context.ref.flush()

  t.deepEqual(t.context.store.state.options, { '.key': 'foo', '.value': null })
})

test('sets the key as null when bound to the root', t => {
  t.context.store.dispatch('setOptionsRef', root)
  t.context.ref.flush()

  t.is(t.context.store.state.options['.key'], null)
})

test('binds multiple references at the same time', t => {
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
