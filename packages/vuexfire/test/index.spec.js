import Vuex from 'vuex'
import { vuefireMutations, firestoreAction } from '../src'
import { db, tick, Vue, delayUpdate } from '@posva/vuefire-test-helpers'

Vue.use(Vuex)

describe('firestoreAction', () => {
  const store = new Vuex.Store({
    mutations: vuefireMutations,
    actions: {
      action: firestoreAction((context, fn) => fn(context))
    }
  })

  const setItems = collection =>
    store.dispatch('action', ({ bindFirestoreRef }) =>
      bindFirestoreRef('items', collection)
    )
  const setItem = document =>
    store.dispatch('action', ({ bindFirestoreRef }) =>
      bindFirestoreRef('item', document)
    )

  let collection, document
  beforeEach(async () => {
    store.replaceState({
      items: null,
      item: null
    })
    collection = db.collection()
    document = db.collection().doc()
    await tick()
  })

  it('binds a collection', async () => {
    expect(store.state.items).toBe(null)
    await setItems(collection)
    expect(store.state.items).toEqual([])
    await collection.add({ text: 'foo' })
    expect(store.state.items).toEqual([{ text: 'foo' }])
  })

  it('binds a document', async () => {
    expect(store.state.item).toBe(null)
    await setItem(document)
    expect(store.state.item).toEqual(null)
    await document.update({ text: 'foo' })
    expect(store.state.item).toEqual({ text: 'foo' })
  })

  it('removes items in collection', async () => {
    await setItems(collection)
    await collection.add({ text: 'foo' })
    expect(store.state.items).toEqual([{ text: 'foo' }])
    await collection.doc(store.state.items[0].id).delete()
    expect(store.state.items).toEqual([])
  })

  it('unbinds previously bound refs', async () => {
    await setItem(document)
    expect(store.state.item).toEqual(null)
    const doc2 = db.collection().doc()
    await doc2.update({ bar: 'bar' })
    await document.update({ foo: 'foo' })
    expect(store.state.item).toEqual({ foo: 'foo' })
    await setItem(doc2)
    expect(store.state.item).toEqual({ bar: 'bar' })
    await document.update({ foo: 'baz' })
    expect(store.state.item).toEqual({ bar: 'bar' })
  })

  it('waits for all refs in document', async () => {
    const a = db.collection().doc()
    const b = db.collection().doc()
    delayUpdate(b)
    await document.update({ a, b })

    await setItem(document)

    expect(store.state.item).toEqual({
      a: null,
      b: null
    })
  })

  it('waits for all refs in document with interrupting by new ref', async () => {
    const a = db.collection().doc()
    const b = db.collection().doc()
    const c = db.collection().doc()
    delayUpdate(b)
    await document.update({ a, b })

    const promise = setItem(document)

    document.update({ c })

    await promise

    expect(store.state.item).toEqual({
      a: null,
      b: null,
      c: null
    })
  })

  it('waits for nested refs with data in collections', async () => {
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

    await setItems(collection)

    expect(store.state.items).toEqual([
      { a: { isA: true }},
      { b: { c: { isC: true }}}
    ])
  })

  it('can unbind a reference', async () => {
    await setItems(collection)
    await collection.add({ text: 'foo' })
    await store.dispatch('action', ({ unbindFirestoreRef }) =>
      unbindFirestoreRef('items')
    )

    expect(store.state.items).toEqual([{ text: 'foo' }])
    await collection.add({ text: 'foo' })
    expect(store.state.items).toEqual([{ text: 'foo' }])
    await setItems(collection)
    expect(store.state.items).toEqual([{ text: 'foo' }, { text: 'foo' }])
  })
})
