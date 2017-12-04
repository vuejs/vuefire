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
    render (h) {
      return h('ul', this.items.map(
        item => h('li', [item])
      ))
    },
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

test('binds a document', () => {
  expect(vm.item).toEqual(null)
})

test('updates a document', async () => {
  await document.update({ foo: 'foo' })
  expect(vm.item).toEqual({ foo: 'foo' })
  await document.update({ bar: 'bar' })
  expect(vm.item).toEqual({ foo: 'foo', bar: 'bar' })
})
