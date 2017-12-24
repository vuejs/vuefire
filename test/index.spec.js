import Vuefire from '../src'
import {
  db,
  tick,
  Vue
} from './helpers'

Vue.use(Vuefire)

let collection, document, vm
beforeEach(async () => {
  collection = db.collection()
  document = collection.doc()
  vm = new Vue({
    // purposely set items as null
    // but it's a good practice to set it to an empty array
    data: () => ({
      items: null,
      item: null
    }),
    firestore: {
      items: collection,
      item: document
    }
  })
  await tick()
})

test('does nothing with no firestore', () => {
  const vm = new Vue({
    data: () => ({ items: null })
  })
  expect(vm.items).toEqual(null)
})

test('setups _firestoreUnbinds', () => {
  expect(vm._firestoreUnbinds).toBeTruthy()
  expect(Object.keys(vm._firestoreUnbinds).sort()).toEqual(['item', 'items'])
})

test('setups _firestoreUnbinds with no firestore options', () => {
  const vm = new Vue({
    data: () => ({ items: null })
  })
  expect(vm._firestoreUnbinds).toBeTruthy()
  expect(Object.keys(vm._firestoreUnbinds)).toEqual([])
})

test('setups $firestoreRefs', () => {
  expect(Object.keys(vm.$firestoreRefs).sort()).toEqual(['item', 'items'])
  expect(vm.$firestoreRefs.item).toBe(document)
  expect(vm.$firestoreRefs.items).toBe(collection)
})

test('clears $firestoreRefs on $destroy', () => {
  vm.$destroy()
  expect(vm.$firestoreRefs).toEqual(null)
})
