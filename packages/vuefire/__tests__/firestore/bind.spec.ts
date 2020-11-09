import { firestorePlugin } from '../../src'
import { db, tick, delayUpdate, Vue } from '@posva/vuefire-test-helpers'
import firebase from 'firebase/app'
import { CombinedVueInstance } from 'vue/types/vue'

Vue.use(firestorePlugin)

describe('Firestore: binding', () => {
  let collection: firebase.firestore.CollectionReference,
    document: firebase.firestore.DocumentReference,
    vm: CombinedVueInstance<Vue, { items: any[]; item: any }, object, object, Record<never, any>>
  beforeEach(async () => {
    // @ts-ignore
    collection = db.collection()
    // @ts-ignore
    document = db.collection().doc()
    // @ts-ignore
    vm = new Vue({
      // purposely set items as null
      // but it's a good practice to set it to an empty array
      data: () => ({
        items: null,
        item: null,
      }),
    })
    await tick()
  })

  it('manually binds a collection', async () => {
    expect(vm.items).toEqual(null)
    await vm.$bind('items', collection)
    expect(vm.items).toEqual([])
    await collection.add({ text: 'foo' })
    expect(vm.items).toEqual([{ text: 'foo' }])
  })

  it('manually binds a document', async () => {
    expect(vm.item).toEqual(null)
    await vm.$bind('item', document)
    expect(vm.item).toEqual(null)
    await document.update({ text: 'foo' })
    expect(vm.item).toEqual({ text: 'foo' })
  })

  it('removes items', async () => {
    collection.add({ name: 'one' })
    collection.add({ name: 'two' })

    await vm.$bind('items', collection)
    await collection.doc(vm.items[1].id).delete()
    expect(vm.items).toEqual([{ name: 'one' }])
  })

  it('returs a promise', () => {
    expect(vm.$bind('items', collection) instanceof Promise).toBe(true)
    expect(vm.$bind('item', document) instanceof Promise).toBe(true)
  })

  it('unbinds previously bound refs', async () => {
    await document.update({ foo: 'foo' })
    // @ts-ignore
    const doc2: firebase.firestore.DocumentReference = db.collection().doc()
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

  it('waits for all refs in document', async () => {
    const a = db.collection().doc()
    // @ts-ignore
    const b: firebase.firestore.DocumentReference = db.collection().doc()
    delayUpdate(b)
    await document.update({ a, b })

    await vm.$bind('item', document)

    expect(vm.item).toEqual({
      a: null,
      b: null,
    })
  })

  test('waits for all refs in document with interrupting by new ref', async () => {
    const a = db.collection().doc()
    // @ts-ignore
    const b: firebase.firestore.DocumentReference = db.collection().doc()
    const c = db.collection().doc()
    delayUpdate(b)
    await document.update({ a, b })

    const promise = vm.$bind('item', document)

    document.update({ c })

    await promise

    expect(vm.item).toEqual({
      a: null,
      b: null,
      c: null,
    })
  })

  it('waits for all refs in collection', async () => {
    const a = db.collection().doc()
    // @ts-ignore
    const b: firebase.firestore.DocumentReference = db.collection().doc()
    delayUpdate(b)
    await collection.add({ a })
    await collection.add({ b })

    await vm.$bind('items', collection)

    expect(vm.items).toEqual([{ a: null }, { b: null }])
  })

  it('waits for nested refs in document', async () => {
    const a = db.collection().doc()
    // @ts-ignore
    const b: firebase.firestore.DocumentReference = db.collection().doc()
    // @ts-ignore
    const c: firebase.firestore.DocumentReference = db.collection().doc()
    await b.update({ c })
    delayUpdate(b)
    delayUpdate(c, 5)
    await document.update({ a, b })

    await vm.$bind('item', document)

    expect(vm.item).toEqual({
      a: null,
      b: { c: null },
    })
  })

  it('waits for nested refs with data in document', async () => {
    const a = db.collection().doc()
    // @ts-ignore
    const b: firebase.firestore.DocumentReference = db.collection().doc()
    // @ts-ignore
    const c: firebase.firestore.DocumentReference = db.collection().doc()
    await a.update({ isA: true })
    await c.update({ isC: true })
    await b.update({ c })
    delayUpdate(b)
    delayUpdate(c, 5)
    await document.update({ a, b })

    await vm.$bind('item', document)

    expect(vm.item).toEqual({
      a: { isA: true },
      b: { c: { isC: true } },
    })
  })

  it('waits for nested refs in collections', async () => {
    const a = db.collection().doc()
    // @ts-ignore
    const b: firebase.firestore.DocumentReference = db.collection().doc()
    // @ts-ignore
    const c: firebase.firestore.DocumentReference = db.collection().doc()
    await b.update({ c })
    delayUpdate(b)
    delayUpdate(c, 5)
    await collection.add({ a })
    await collection.add({ b })

    await vm.$bind('items', collection)

    expect(vm.items).toEqual([{ a: null }, { b: { c: null } }])
  })

  it('waits for nested refs with data in collections', async () => {
    const a = db.collection().doc()
    // @ts-ignore
    const b: firebase.firestore.DocumentReference = db.collection().doc()
    // @ts-ignore
    const c: firebase.firestore.DocumentReference = db.collection().doc()
    await a.update({ isA: true })
    await c.update({ isC: true })
    await b.update({ c })
    delayUpdate(b)
    delayUpdate(c, 5)
    await collection.add({ a })
    await collection.add({ b })

    await vm.$bind('items', collection)

    expect(vm.items).toEqual([{ a: { isA: true } }, { b: { c: { isC: true } } }])
  })

  it('can customize the reset option through $bind', async () => {
    await document.update({ foo: 'foo' })
    // @ts-ignore
    const doc2: firebase.firestore.DocumentReference = db.collection().doc()
    await doc2.update({ bar: 'bar' })
    await vm.$bind('item', document)
    expect(vm.item).toEqual({ foo: 'foo' })
    const p = vm.$bind('item', doc2, { reset: false })
    expect(vm.item).toEqual({ foo: 'foo' })
    await p
    expect(vm.item).toEqual({ bar: 'bar' })
    vm.$bind('item', document)
    expect(vm.item).toEqual(null)
  })

  it('can customize the reset option through $unbind', async () => {
    await document.update({ foo: 'foo' })
    // @ts-ignore
    const doc2: firebase.firestore.DocumentReference = db.collection().doc()
    await doc2.update({ bar: 'bar' })
    await vm.$bind('item', document)
    vm.$unbind('item', false)
    expect(vm.item).toEqual({ foo: 'foo' })
    // the reset option should have no effect on the latter unbind
    await vm.$bind('item', document, { reset: () => ({ bar: 'bar' }) })
    vm.$unbind('item')
    expect(vm.item).toEqual(null)
  })

  it('do not reset if wait: true', async () => {
    await collection.add({ foo: 'foo' })
    await vm.$bind('items', collection)
    // @ts-ignore
    const col2: firebase.firestore.CollectionReference = db.collection()
    await col2.add({ bar: 'bar' })
    const p = vm.$bind('items', col2, { wait: true, reset: true })
    expect(vm.items).toEqual([{ foo: 'foo' }])
    await p
    expect(vm.items).toEqual([{ bar: 'bar' }])
  })

  it('wait + reset can be overriden with a function', async () => {
    await collection.add({ foo: 'foo' })
    await vm.$bind('items', collection)
    // @ts-ignore
    const col2: firebase.firestore.CollectionReference = db.collection()
    await col2.add({ bar: 'bar' })
    const p = vm.$bind('items', col2, { wait: true, reset: () => ['foo'] })
    expect(vm.items).toEqual(['foo'])
    await p
    expect(vm.items).toEqual([{ bar: 'bar' }])
  })
})
