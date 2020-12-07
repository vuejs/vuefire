import Vuex from 'vuex'
import { firebaseAction, vuexfireMutations } from '../src'
import { MockFirebase, tick, Vue } from '@posva/vuefire-test-helpers'
import firebase from 'firebase/app'

import { RTDBOptions } from '@posva/vuefire-core/dist/packages/@posva/vuefire-core/src'

Vue.use(Vuex)

const db = new MockFirebase().child('data')

describe('RTDB: firebaseAction', () => {
  const item: any = null,
    items: any[] = []
  const store = new Vuex.Store<{ item: any; items: any[] }>({
    state: { items, item },
    mutations: vuexfireMutations,
    actions: {
      action: firebaseAction((context, fn) => fn(context)),
    },

    modules: {
      module: {
        namespaced: true,
        actions: {
          action: firebaseAction((context, fn) => fn(context)),
        },
      },
      vanillaFunction: {
        namespaced: true,
        actions: {
          action: firebaseAction(function(context, fn) {
            // @ts-ignore
            return fn.call(this, context)
          }),
        },
      },
    },
  })

  const setItems = (query: firebase.database.Query, options?: RTDBOptions) =>
    // @ts-ignore
    store.dispatch('action', ({ bindFirebaseRef }) => bindFirebaseRef('items', query, options))
  const setItem = (ref: firebase.database.Reference, options?: RTDBOptions) =>
    // @ts-ignore
    store.dispatch('action', ({ bindFirebaseRef }) => bindFirebaseRef('item', ref, options))

  let collection: firebase.database.Reference, document: firebase.database.Reference
  beforeEach(async () => {
    store.replaceState({
      items: [],
      item: null,
    })
    collection = db.child('data')
    document = db.child('item')
    // @ts-ignore
    collection.autoFlush()
    // @ts-ignore
    document.autoFlush()
    await tick()
  })

  it('binds a collection', async () => {
    expect(store.state.items).toEqual([])
    await setItems(collection)
    expect(store.state.items).toEqual([])
    collection.push({ text: 'foo' })
    expect(store.state.items).toEqual([{ text: 'foo' }])
  })

  it('binds a document', async () => {
    expect(store.state.item).toBe(null)
    await setItem(document)
    expect(store.state.item).toEqual({})
    document.set({ text: 'foo' })
    expect(store.state.item).toEqual({ text: 'foo' })
  })

  it('removes items in collection', async () => {
    await setItems(collection)
    expect(store.state.items).toEqual([{ text: 'foo' }])
    collection.child(store.state.items[0]['.key']).remove()
    expect(store.state.items).toEqual([])
  })

  it('unbinds previously bound refs', async () => {
    await setItem(document)
    const doc2 = db.child('doc2')
    // @ts-ignore
    doc2.autoFlush()
    doc2.set({ bar: 'bar' })
    await setItem(doc2)
    expect(store.state.item).toEqual({ bar: 'bar' })
    document.set({ foo: 'baz' })
    expect(store.state.item).toEqual({ bar: 'bar' })
  })

  it('can unbind a reference', async () => {
    await setItems(collection)
    collection.push({ text: 'foo' })
    await store.dispatch(
      'action',
      // @ts-ignore
      ({ unbindFirebaseRef }) => unbindFirebaseRef('items')
    )

    expect(store.state.items).toEqual([])
    collection.push({ text: 'foo' })
    expect(store.state.items).toEqual([])
    await setItems(collection)
    expect(store.state.items).toEqual([{ text: 'foo' }, { text: 'foo' }])
  })

  it('does not throw there is nothing to unbind', async () => {
    await setItems(collection)
    await store.dispatch(
      'action',
      // @ts-ignore
      ({ unbindFirebaseRef }) =>
        expect(() => {
          unbindFirebaseRef('items')
          unbindFirebaseRef('items')
        }).not.toThrow()
    )

    await store.dispatch(
      'module/action',
      // @ts-ignore
      ({ unbindFirebaseRef }) =>
        expect(() => {
          unbindFirebaseRef('items')
          unbindFirebaseRef('items')
        }).not.toThrow()
    )
  })

  it('propagates value of `this` to wrapped action', async () => {
    await store.dispatch('vanillaFunction/action', function() {
      // @ts-ignore
      expect(this._vm).toBeInstanceOf(Vue)
    })
  })

  it('can unbind without resetting', async () => {
    await setItem(document)
    document.set({ text: 'foo' })
    await store.dispatch(
      'action',
      // @ts-ignore
      ({ unbindFirebaseRef }) =>
        expect(() => {
          unbindFirebaseRef('item', false)
        }).not.toThrow()
    )

    expect(store.state.item).toEqual({ text: 'foo' })
  })

  // TODO: for some reason the manual flushing is not working
  // and setItem is resolved right away, so it's impossible to check in between calls
  it.skip('can customize the reset option when binding', async () => {
    const document = db.child('foo')
    const other = db.child('bar')

    let p = setItem(document)
    document.set({ text: 'foo' })
    // @ts-ignore
    // document.flush()
    await p
    expect(store.state.item).toEqual({ text: 'foo' })
    p = setItem(other, { reset: false })
    expect(store.state.item).toEqual({ text: 'foo' })
    other.set({ text: 'bar' })
    // @ts-ignore
    other.flush()
    await p
    expect(store.state.item).toEqual({ text: 'bar' })
    p = setItem(document)
    // @ts-ignore
    // document.flush()
    // await p
    expect(store.state.item).toEqual(null)
  })
})
