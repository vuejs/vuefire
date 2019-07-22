import Vuex from 'vuex'
import { vuexfireMutations, firestoreAction } from '../src'
import { db, tick, Vue } from '@posva/vuefire-test-helpers'
import { firestore } from 'firebase'
import { FirestoreOptions } from '@posva/vuefire-core/dist/packages/@posva/vuefire-core/src'

Vue.use(Vuex)

describe('firestoreAction', () => {
  const item: any = null,
    items: any[] = []
  const store = new Vuex.Store<{ item: any; items: any[] }>({
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
    },
  })

  const setItems = (
    collection: firestore.CollectionReference | firestore.Query,
    options?: FirestoreOptions
  ) =>
    // @ts-ignore
    store.dispatch('action', ({ bindFirestoreRef }) =>
      bindFirestoreRef('items', collection, options)
    )
  const setItem = (document: firestore.DocumentReference, options?: FirestoreOptions) =>
    // @ts-ignore
    store.dispatch('action', ({ bindFirestoreRef }) => bindFirestoreRef('item', document, options))

  let collection: firestore.CollectionReference, document: firestore.DocumentReference
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

  it('calls serialize with a collection', async () => {
    expect(store.state.items).toBe(null)
    const serialize = jest.fn(() => ({ foo: 'bar' }))
    await setItems(collection, { serialize })
    await collection.add({ text: 'foo' })
    expect(serialize).toHaveBeenCalledTimes(1)
    expect(store.state.items).toEqual([{ foo: 'bar' }])
  })

  it('calls serialize with a document', async () => {
    expect(store.state.item).toBe(null)
    const serialize = jest.fn(() => ({ foo: 'bar' }))
    await setItem(document, { serialize })
    await document.set({ text: 'foo' })
    expect(serialize).toHaveBeenCalledTimes(1)
    expect(store.state.item).toEqual({ foo: 'bar' })
  })
})
