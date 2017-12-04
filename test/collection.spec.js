import sinon from 'sinon'
import Vuefire from '../src'
import {
  db,
  tick,
  Vue
} from './helpers'

Vue.use(Vuefire)

let collection, vm
beforeEach(async () => {
  collection = db.collection()
  vm = new Vue({
    render (h) {
      return h('ul', this.items.map(
        item => h('li', [item])
      ))
    },
    data: () => ({ items: null }),
    firestore: {
      items: collection
    }
  })
  await tick()
})

test('initialise the array', () => {
  expect(vm.items).toEqual([])
})

test('add elements', async () => {
  await collection.add({ text: 'foo' })
  expect(vm.items).toEqual([{ text: 'foo' }])
  await collection.add({ text: 'bar' })
  expect(vm.items).toEqual([{ text: 'foo' }, { text: 'bar' }])
})

test('delets items', async () => {
  await collection.add({ text: 'foo' })
  await collection.doc(vm.items[0].id).delete()
  expect(vm.items).toEqual([])
})

test('update items', async () => {
  const doc = await collection.add({ text: 'foo', more: true })
  await doc.update({ text: 'bar' })
  expect(vm.items[0]).toEqual({ text: 'bar', more: true })
})

test('add properties', async () => {
  const doc = await collection.add({ text: 'foo' })
  await doc.update({ other: 'bar' })
  expect(vm.items[0]).toEqual({ text: 'foo', other: 'bar' })
})

test('unbinds when the instance is destroyed', async () => {
  expect(vm._firestoreUnbinds).toBeTruthy()
  expect(vm.items).toEqual([])
  const spy = sinon.spy(vm._firestoreUnbinds, 'items')
  expect(() => {
    vm.$destroy()
  }).not.toThrow()
  expect(spy.callCount).toBe(1)
  expect(vm._firestoreUnbinds).toBe(null)
  await expect(async () => {
    await collection.add({ text: 'foo' })
    expect(vm.items).toEqual([])
  }).not.toThrow()
})
