import Vuex from 'vuex'
import { firebaseAction, vuexfireMutations } from '../../src'
import { MockFirebase, tick, Vue } from '@posva/vuefire-test-helpers'

Vue.use(Vuex)

const db = new MockFirebase().child('data')

describe('RTDB: firebaseAction', () => {
  const store = new Vuex.Store({
    mutations: vuexfireMutations,
    actions: {
      action: firebaseAction((context, fn) => fn(context))
    },

    modules: {
      module: {
        namespaced: true,
        actions: {
          action: firebaseAction((context, fn) => fn(context))
        }
      }
    }
  })

  const setItems = collection =>
    store.dispatch('action', ({ bindFirebaseRef }) =>
      bindFirebaseRef('items', collection)
    )
  const setItem = document =>
    store.dispatch('action', ({ bindFirebaseRef }) =>
      bindFirebaseRef('item', document)
    )

  let collection, document
  beforeEach(async () => {
    store.replaceState({
      items: [],
      item: null
    })
    collection = db.child('data')
    document = db.child('item')
    collection.autoFlush()
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
    doc2.autoFlush()
    doc2.set({ bar: 'bar' })
    setItem(doc2)
    expect(store.state.item).toEqual({ bar: 'bar' })
    document.set({ foo: 'baz' })
    expect(store.state.item).toEqual({ bar: 'bar' })
  })

  it('can unbind a reference', async () => {
    await setItems(collection)
    collection.push({ text: 'foo' })
    await store.dispatch('action', ({ unbindFirebaseRef }) =>
      unbindFirebaseRef('items')
    )

    expect(store.state.items).toEqual([])
    collection.push({ text: 'foo' })
    expect(store.state.items).toEqual([])
    await setItems(collection)
    expect(store.state.items).toEqual([{ text: 'foo' }, { text: 'foo' }])
  })

  it('does not throw there is nothing to unbind', async () => {
    await setItems(collection)
    await store.dispatch('action', ({ unbindFirebaseRef }) =>
      expect(() => {
        unbindFirebaseRef('items')
        unbindFirebaseRef('items')
      }).not.toThrow()
    )

    await store.dispatch('module/action', ({ unbindFirebaseRef }) =>
      expect(() => {
        unbindFirebaseRef('items')
        unbindFirebaseRef('items')
      }).not.toThrow()
    )
  })
})
