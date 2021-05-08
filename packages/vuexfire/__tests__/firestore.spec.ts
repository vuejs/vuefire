import { createStore } from 'vuex'
import { vuexfireMutations, firestoreAction } from '../src'
import { db, tick, Vue, delayUpdate } from '@posva/vuefire-test-helpers'
import firebase from 'firebase/app'
import { FirestoreOptions } from '@posva/vuefire-core/dist/packages/@posva/vuefire-core/src'

describe('firestoreAction', () => {
  const item: any = null,
    items: any[] = []
  const store = createStore({
    state: { item, items },
    mutations: vuexfireMutations,
    actions: {
      action: firestoreAction((context, fn) => fn(context)),
    },

    modules: {
      module: {
        namespaced: true,
        actions: {
          action: firestoreAction((context, fn) => fn(context)),
        },
      },
      vanillaFunction: {
        namespaced: true,
        actions: {
          action: firestoreAction(function(context, fn) {
            // @ts-ignore
            return fn.call(this, context)
          }),
        },
      },
    },
  })

  const setItems = (
    collection: firebase.firestore.CollectionReference | firebase.firestore.Query,
    options?: FirestoreOptions
  ) =>
    // @ts-ignore
    store.dispatch('action', ({ bindFirestoreRef }) =>
      bindFirestoreRef('items', collection, options)
    )
  const setItem = (document: firebase.firestore.DocumentReference) =>
    // @ts-ignore
    store.dispatch('action', ({ bindFirestoreRef }) => bindFirestoreRef('item', document))

  let collection: firebase.firestore.CollectionReference,
    document: firebase.firestore.DocumentReference
  beforeEach(async () => {
    store.replaceState({
      // @ts-ignore
      items: null,
      item: null,
      module: {
        items: [],
      },
    })

    // @ts-ignore
    collection = db.collection()
    // @ts-ignore
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
    // @ts-ignore
    const doc2: firestore.DocumentReference = db.collection().doc()
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
    // @ts-ignore
    const b: firestore.DocumentReference = db.collection().doc()
    delayUpdate(b)
    await document.update({ a, b })

    await setItem(document)

    expect(store.state.item).toEqual({
      a: null,
      b: null,
    })
  })

  it('waits for all refs in document with interrupting by new ref', async () => {
    const a = db.collection().doc()
    // @ts-ignore
    const b: firestore.DocumentReference = db.collection().doc()
    const c = db.collection().doc()
    delayUpdate(b)
    await document.update({ a, b })

    const promise = setItem(document)

    document.update({ c })

    await promise

    expect(store.state.item).toEqual({
      a: null,
      b: null,
      c: null,
    })
  })

  it('waits for nested refs with data in collections', async () => {
    const a = db.collection().doc()
    // @ts-ignore
    const b: firestore.DocumentReference = db.collection().doc()
    // @ts-ignore
    const c: firestore.DocumentReference = db.collection().doc()
    await a.update({ isA: true })
    await c.update({ isC: true })
    await b.update({ c })
    delayUpdate(b)
    delayUpdate(c, 5)
    await collection.add({ a })
    await collection.add({ b })

    await setItems(collection)

    expect(store.state.items).toEqual([{ a: { isA: true } }, { b: { c: { isC: true } } }])
  })

  it('can unbind a reference', async () => {
    await setItems(collection)
    await collection.add({ text: 'foo' })
    await store.dispatch(
      'action',
      // @ts-ignore
      ({ unbindFirestoreRef }) => unbindFirestoreRef('items')
    )

    expect(store.state.items).toEqual([])
    await collection.add({ text: 'foo' })
    expect(store.state.items).toEqual([])
    await setItems(collection)
    expect(store.state.items).toEqual([{ text: 'foo' }, { text: 'foo' }])
  })

  it('can unbind without resetting', async () => {
    await setItems(collection)
    await collection.add({ text: 'foo' })
    await store.dispatch(
      'action',
      // @ts-ignore
      ({ unbindFirestoreRef }) => unbindFirestoreRef('items', false)
    )

    expect(store.state.items).toEqual([{ text: 'foo' }])
  })

  it('does not throw there is nothing to unbind', async () => {
    await setItems(collection)
    await store.dispatch(
      'action',
      // @ts-ignore
      ({ unbindFirestoreRef }) =>
        expect(() => {
          unbindFirestoreRef('items')
          unbindFirestoreRef('items')
        }).not.toThrow()
    )

    await store.dispatch(
      'module/action',
      // @ts-ignore
      ({ unbindFirestoreRef }) =>
        expect(() => {
          unbindFirestoreRef('items')
          unbindFirestoreRef('items')
        }).not.toThrow()
    )
  })

  it('propagates value of `this` to wrapped action', async () => {
    await store.dispatch('vanillaFunction/action', function() {
      // @ts-ignore
      expect(this._vm).toBeInstanceOf(Vue)
    })
  })

  it('does not reset if wait: true', async () => {
    // @ts-ignore
    const col2: firestore.CollectionReference = db.collection()
    await setItems(collection)
    await collection.add({ text: 'foo' })
    const p = setItems(col2, { wait: true, reset: true })
    expect(store.state.items).toEqual([{ text: 'foo' }])
    await p
    expect(store.state.items).toEqual([])
  })

  it('wait + reset can be overriden with a function', async () => {
    // @ts-ignore
    const col2: firestore.CollectionReference = db.collection()
    await setItems(collection)
    await collection.add({ text: 'foo' })
    const p = setItems(col2, { wait: true, reset: () => ['foo'] })
    expect(store.state.items).toEqual(['foo'])
    await p
    expect(store.state.items).toEqual([])
  })
})
