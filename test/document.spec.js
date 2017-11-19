import test from 'ava'
import Vuefire from '../src'
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
      items: t.context.collection,
      item: t.context.document
    }
  }).$mount()
  await tick()
})

test('binds a document', t => {
  t.deepEqual(t.context.vm.item, null)
})

test('updates a document', async t => {
  await t.context.document.update({ foo: 'foo' })
  t.deepEqual(t.context.vm.item, { foo: 'foo' })
  await t.context.document.update({ bar: 'bar' })
  t.deepEqual(t.context.vm.item, { foo: 'foo', bar: 'bar' })
})
