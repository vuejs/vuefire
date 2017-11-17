import test from 'ava'
import Vuefire from '../src'
import {
  createSnapshot
} from '../src/utils'
import {
  db,
  tick,
  Vue
} from './helpers'

Vue.use(Vuefire)

test.beforeEach(async t => {
  t.context.collection = db.collection()
  t.context.document = t.context.collection.doc()
  t.context.vm = new Vue({
    render (h) {
      return h('ul', this.items && this.items.map(
        item => h('li', [item])
      ))
    },
    // purposely set items as null
    // but it's a good practice to set it to an empty array
    data: () => ({
      items: null,
      item: null,
    }),
  }).$mount()
  await tick()
})

test('manually binds a collection', async t => {
  const vm = t.context.vm
  const collection = t.context.collection
  t.deepEqual(vm.items, null)
  await vm.$bind('items', collection)
  t.deepEqual(vm.items, [])
  await collection.add({ text: 'foo' })
  t.deepEqual(vm.items, [{ text: 'foo' }])
})
