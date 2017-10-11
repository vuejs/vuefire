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
      return h('ul', this.items.map(
        item => h('li', [item])
      ))
    },
    // purposely set items as null
    // but it's a good practice to set it to an empty array
    data: () => ({ items: null }),
    firestore: {
      items: t.context.collection,
      item: t.context.document
    }
  }).$mount()
  await tick()
})

test('detects collections', async t => {
  await t.context.document.update({ foo: 'foo' })
  t.deepEqual(t.context.vm.item, { foo: 'foo' })
})

test('detects documents', async t => {
  await t.context.collection.add({ foo: 'foo' })
  t.deepEqual(t.context.vm.items, [{ foo: 'foo' }])
})

test('does nothing with no firestore', t => {
  const vm = new Vue({
    render (h) {
      return h('ul', this.items.map(
        item => h('li', [item])
      ))
    },
    data: () => ({ items: null }),
  })
  t.deepEqual(vm.items, null)
})
