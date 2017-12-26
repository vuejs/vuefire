import Vuefire from '../src'
import {
  db,
  tick,
  Key,
  Vue
} from './helpers'

Vue.use(Vuefire)

let collection, vm
beforeEach(async () => {
  collection = db.collection()
  vm = new Vue({
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
  const spy = jest.spyOn(vm._firestoreUnbinds, 'items')
  expect(() => {
    vm.$destroy()
  }).not.toThrow()
  expect(spy).toHaveBeenCalled()
  expect(vm._firestoreUnbinds).toBe(null)
  await expect(async () => {
    await collection.add({ text: 'foo' })
    expect(vm.items).toEqual([])
  }).not.toThrow()
})

test('adds non-enumerable id', async () => {
  const a = await collection.doc('u0')
  const b = await collection.doc('u1')
  await a.update({})
  await b.update({})
  expect(vm.items.length).toBe(2)
  vm.items.forEach((item, i) => {
    expect(Object.getOwnPropertyDescriptor(item, 'id')).toEqual({
      configurable: false,
      enumerable: false,
      writable: false,
      value: `u${i}`
    })
  })
})
