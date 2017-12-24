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

test('manually unbinds a collection', async () => {
  const spy = jest.spyOn(vm._firestoreUnbinds, 'items')
  vm.$unbind('items')
  expect(spy).toHaveBeenCalled()
  expect(Object.keys(vm._firestoreUnbinds)).toEqual(['item'])
  expect(Object.keys(vm.$firestoreRefs)).toEqual(['item'])
  expect(vm.items).toEqual([])
  await collection.add({ text: 'foo' })
  expect(vm.items).toEqual([])
  spy.mockRestore()
})

test('manually unbinds a document', async () => {
  const spy = jest.spyOn(vm._firestoreUnbinds, 'item')
  vm.$unbind('item')
  expect(spy).toHaveBeenCalled()
  expect(Object.keys(vm._firestoreUnbinds)).toEqual(['items'])
  expect(Object.keys(vm.$firestoreRefs)).toEqual(['items'])
  expect(vm.item).toEqual(null)
  await document.update({ foo: 'foo' })
  expect(vm.item).toEqual(null)
  spy.mockRestore()
})
