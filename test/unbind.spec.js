import test from 'ava'
import sinon from 'sinon'
import Vuefire from '../src'
import {
  db,
  tick,
  Vue
} from './helpers'

Vue.use(Vuefire)

test.beforeEach(async t => {
  t.context.collection = db.collection()
  t.context.document = t.context.collection.doc()
  t.context.vm = new Vue({
    render (h) {
      return h('ul', this.items && this.items.map(
        item => h('li', [item])
      ))
    },
    // purposely set items as null
    // but it's a good practice to set it to an empty array
    data: () => ({
      items: null,
      item: null
    }),
    firestore: {
      items: t.context.collection,
      item: t.context.document
    }
  }).$mount()
  await tick()
})

test('manually unbinds a collection', async t => {
  const vm = t.context.vm
  const spy = sinon.spy(vm._firestoreUnbinds, 'items')
  vm.$unbind('items')
  t.is(spy.callCount, 1)
  t.deepEqual(Object.keys(vm._firestoreUnbinds), ['item'])
  t.deepEqual(Object.keys(vm.$firestoreRefs), ['item'])
  t.deepEqual(vm.items, [])
  await t.context.collection.add({ text: 'foo' })
  t.deepEqual(vm.items, [])
})

test('manually unbinds a document', async t => {
  const vm = t.context.vm
  const spy = sinon.spy(vm._firestoreUnbinds, 'item')
  vm.$unbind('item')
  t.is(spy.callCount, 1)
  t.deepEqual(Object.keys(vm._firestoreUnbinds), ['items'])
  t.deepEqual(Object.keys(vm.$firestoreRefs), ['items'])
  t.deepEqual(vm.item, null)
  await t.context.document.update({ foo: 'foo' })
  t.deepEqual(vm.item, null)
})
