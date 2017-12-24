import Vuefire from '../src'
import {
  db,
  tick,
  Key,
  Vue
} from './helpers'

Vue.use(Vuefire)

let collection, document, vm
beforeEach(async () => {
  collection = db.collection()
  document = collection.doc()
  vm = new Vue({
    data: () => ({
      item: null
    }),
    firestore: {
      item: document
    }
  })
  await tick()
})

test('binds a document', () => {
  expect(vm.item).toEqual(null)
})

test('updates a document', async () => {
  await document.update({ foo: 'foo' })
  expect(vm.item).toEqual({ foo: 'foo' })
  await document.update({ bar: 'bar' })
  expect(vm.item).toEqual({ foo: 'foo', bar: 'bar' })
})

test('adds non-enumerable id', async () => {
  document = collection.doc(new Key('some-id'))
  await document.update({ foo: 'foo' })
  await vm.$bind('item', document)
  expect(Object.getOwnPropertyDescriptor(vm.item, 'id')).toEqual({
    configurable: false,
    enumerable: false,
    writable: false,
    value: 'some-id'
  })
})
