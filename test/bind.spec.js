import Vuefire from '../src'
import {
  db,
  tick,
  delayUpdate,
  Vue
} from './helpers'

Vue.use(Vuefire)

let collection, document, vm
beforeEach(async () => {
  collection = db.collection()
  document = db.collection().doc()
  vm = new Vue({
    // purposely set items as null
    // but it's a good practice to set it to an empty array
    data: () => ({
      items: null,
      item: null
    })
  })
  await tick()
})

test('manually binds a collection', async () => {
  expect(vm.items).toEqual(null)
  await vm.$bind('items', collection)
  expect(vm.items).toEqual([])
  await collection.add({ text: 'foo' })
  expect(vm.items).toEqual([{ text: 'foo' }])
})

test('manually binds a document', async () => {
  expect(vm.item).toEqual(null)
  await vm.$bind('item', document)
  expect(vm.item).toEqual(null)
  await document.update({ text: 'foo' })
  expect(vm.item).toEqual({ text: 'foo' })
})

test('returs a promise', () => {
  expect(vm.$bind('items', collection) instanceof Promise).toBe(true)
  expect(vm.$bind('item', document) instanceof Promise).toBe(true)
})

test('waits for the data to be set when binding a collection', async () => {
  collection.add({ foo: 'foo' })
  const promise = vm.$bind('items', collection)
  expect(vm.items).toEqual([])
  await promise
  expect(vm.items).toEqual([{ foo: 'foo' }])
})

test('waits for the data to be set when binding a document', async () => {
  document.update({ foo: 'foo' })
  const promise = vm.$bind('item', document)
  expect(vm.item).toEqual(null)
  await promise
  expect(vm.item).toEqual({ foo: 'foo' })
})

test('rejects the promise when errors', async () => {
  const fakeOnSnapshot = (_, fail) => {
    fail(new Error('nope'))
  }
  document.onSnapshot = jest.fn(fakeOnSnapshot)
  collection.onSnapshot = jest.fn(fakeOnSnapshot)
  await expect(vm.$bind('items', collection)).rejects.toThrow()
  await expect(vm.$bind('item', document)).rejects.toThrow()
  document.onSnapshot.mockRestore()
  collection.onSnapshot.mockRestore()
})

test('unbinds previously bound refs', async () => {
  await document.update({ foo: 'foo' })
  const doc2 = db.collection().doc()
  await doc2.update({ bar: 'bar' })
  await vm.$bind('item', document)
  expect(vm.$firestoreRefs.item).toBe(document)
  expect(vm.item).toEqual({ foo: 'foo' })
  await vm.$bind('item', doc2)
  expect(vm.item).toEqual({ bar: 'bar' })
  await document.update({ foo: 'baz' })
  expect(vm.$firestoreRefs.item).toBe(doc2)
  expect(vm.item).toEqual({ bar: 'bar' })
})

test('waits for all refs in document', async () => {
  const a = db.collection().doc()
  const b = db.collection().doc()
  delayUpdate(b)
  await document.update({ a, b })

  await vm.$bind('item', document)

  expect(vm.item).toEqual({
    a: null,
    b: null
  })
})

test('waits for all refs in document with interrupting by new ref', async () => {
  const a = db.collection().doc()
  const b = db.collection().doc()
  const c = db.collection().doc()
  delayUpdate(b)
  await document.update({ a, b })

  const promise = vm.$bind('item', document)

  document.update({ c })

  await promise

  expect(vm.item).toEqual({
    a: null,
    b: null,
    c: null
  })
})

test('waits for all refs in collection', async () => {
  const a = db.collection().doc()
  const b = db.collection().doc()
  delayUpdate(b)
  await collection.add({ a })
  await collection.add({ b })

  await vm.$bind('items', collection)

  expect(vm.items).toEqual([
    { a: null },
    { b: null }
  ])
})

test('waits for nested refs in document', async () => {
  const a = db.collection().doc()
  const b = db.collection().doc()
  const c = db.collection().doc()
  await b.update({ c })
  delayUpdate(b)
  delayUpdate(c, 5)
  await document.update({ a, b })

  await vm.$bind('item', document)

  expect(vm.item).toEqual({
    a: null,
    b: { c: null }
  })
})

test('waits for nested refs with data in document', async () => {
  const a = db.collection().doc()
  const b = db.collection().doc()
  const c = db.collection().doc()
  await a.update({ isA: true })
  await c.update({ isC: true })
  await b.update({ c })
  delayUpdate(b)
  delayUpdate(c, 5)
  await document.update({ a, b })

  await vm.$bind('item', document)

  expect(vm.item).toEqual({
    a: { isA: true },
    b: { c: { isC: true }}
  })
})

test('waits for nested refs in collections', async () => {
  const a = db.collection().doc()
  const b = db.collection().doc()
  const c = db.collection().doc()
  await b.update({ c })
  delayUpdate(b)
  delayUpdate(c, 5)
  await collection.add({ a })
  await collection.add({ b })

  await vm.$bind('items', collection)

  expect(vm.items).toEqual([
    { a: null },
    { b: { c: null }}
  ])
})

test('waits for nested refs with data in collections', async () => {
  const a = db.collection().doc()
  const b = db.collection().doc()
  const c = db.collection().doc()
  await a.update({ isA: true })
  await c.update({ isC: true })
  await b.update({ c })
  delayUpdate(b)
  delayUpdate(c, 5)
  await collection.add({ a })
  await collection.add({ b })

  await vm.$bind('items', collection)

  expect(vm.items).toEqual([
    { a: { isA: true }},
    { b: { c: { isC: true }}}
  ])
})
