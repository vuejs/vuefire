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
  t.context.document = db.collection().doc()
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
    })
  }).$mount()
  await tick()
})

test('manually binds a collection', async t => {
  const { vm, collection } = t.context
  t.deepEqual(vm.items, null)
  await vm.$bind('items', collection)
  t.deepEqual(vm.items, [])
  await collection.add({ text: 'foo' })
  t.deepEqual(vm.items, [{ text: 'foo' }])
})

test('manually binds a document', async t => {
  const { vm, document } = t.context
  t.deepEqual(vm.item, null)
  await vm.$bind('item', document)
  t.deepEqual(vm.item, null)
  await document.update({ text: 'foo' })
  t.deepEqual(vm.item, { text: 'foo' })
})

test('returs a promise', t => {
  const { vm, document, collection } = t.context
  t.true(vm.$bind('items', collection) instanceof Promise)
  t.true(vm.$bind('item', document) instanceof Promise)
})

test('rejects the promise when errors', async t => {
  const { vm, document, collection } = t.context
  const fakeOnSnapshot = (_, fail) => {
    fail(new Error('nope'))
  }
  sinon.stub(document, 'onSnapshot').callsFake(fakeOnSnapshot)
  sinon.stub(collection, 'onSnapshot').callsFake(fakeOnSnapshot)
  await t.throws(vm.$bind('items', collection))
  await t.throws(vm.$bind('item', document))
  document.onSnapshot.restore()
  collection.onSnapshot.restore()
})
