import { firestorePlugin } from '../../src'
import { db, tick, Vue } from '@posva/vuefire-test-helpers'
import firebase from 'firebase/app'
import { CombinedVueInstance } from 'vue/types/vue'

Vue.use(firestorePlugin)

describe('Firestore: firestore option', () => {
  let collection: firebase.firestore.CollectionReference,
    document: firebase.firestore.DocumentReference,
    vm: CombinedVueInstance<Vue, { items: any[]; item: any }, object, object, Record<never, any>>
  beforeEach(async () => {
    // @ts-ignore
    collection = db.collection()
    document = collection.doc()
    // @ts-ignore
    vm = new Vue({
      // purposely set items as null
      // but it's a good practice to set it to an empty array
      data: () => ({
        items: null,
        item: null,
      }),
      firestore: {
        items: collection,
        item: document,
      },
    })
    await tick()
  })

  it('does nothing with no firestore', () => {
    const vm = new Vue({
      data: () => ({ items: null }),
    })
    expect(vm.items).toEqual(null)
  })

  it('setups _firestoreUnbinds', () => {
    expect(vm._firestoreUnbinds).toBeTruthy()
    expect(Object.keys(vm._firestoreUnbinds).sort()).toEqual(['item', 'items'])
  })

  it('setups _firestoreUnbinds with no firestore options', () => {
    const vm = new Vue({
      data: () => ({ items: null }),
    })
    expect(vm._firestoreUnbinds).toBeTruthy()
    expect(Object.keys(vm._firestoreUnbinds)).toEqual([])
  })

  it('setups $firestoreRefs', () => {
    expect(Object.keys(vm.$firestoreRefs).sort()).toEqual(['item', 'items'])
    expect(vm.$firestoreRefs.item).toBe(document)
    expect(vm.$firestoreRefs.items).toBe(collection)
  })

  it('clears $firestoreRefs on $destroy', () => {
    vm.$destroy()
    expect(vm.$firestoreRefs).toEqual(null)
  })
})
