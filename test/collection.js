import test from 'ava'
import Vuefire from '../src'
import {
  createSnapshot
} from '../src/utils'
import {
  db,
  tick,
  Vue
} from './helpers'

Vue.use(Vuefire)

test.beforeEach(async t => {
  t.context.collection = db.collection()
  t.context.vm = new Vue({
    render (h) {
      return h('ul', this.items.map(
        item => h('li', [item])
      ))
    },
    data: () => ({ items: null }),
    firestore: {
      items: t.context.collection
    }
  }).$mount()
  await tick()
})

test('initialise the array', t => {
  t.deepEqual(t.context.vm.items, [])
})

test('add elements', async t => {
  await t.context.collection.add({ text: 'foo' })
  t.deepEqual(t.context.vm.items, [{ text: 'foo' }])
  await t.context.collection.add({ text: 'bar' })
  t.deepEqual(t.context.vm.items, [{ text: 'foo' }, { text: 'bar' }])
})

test('delets items', async t => {
  await t.context.collection.add({ text: 'foo' })
  await t.context.collection.doc(t.context.vm.items[0].id).delete()
  t.deepEqual(t.context.vm.items, [])
})

test('update items', async t => {
  const doc = await t.context.collection.add({ text: 'foo', more: true })
  await doc.update({ text: 'bar' })
  t.deepEqual(t.context.vm.items[0], { text: 'bar', more: true })
})

test('add properties', async t => {
  const doc = await t.context.collection.add({ text: 'foo' })
  await doc.update({ other: 'bar' })
  t.deepEqual(t.context.vm.items[0], { text: 'foo', other: 'bar' })
})
