import test from 'ava'
import Vuefire from '../src'
import { tick, Vue } from './helpers'
import { collection } from './helpers'

Vue.use(Vuefire)

const vm = new Vue({
  render (h) {
    return h('ul', this.items.map(
      item => h('li', [item])
    ))
  },
  data: () => ({ items: [] }),
  firestore: {
    items: collection
  }
}).$mount()

Vue.use(Vuefire)

test('foo', async t => {
  await tick()
  t.deepEqual(vm.items, [])
  t.pass()
})

test('bar', async t => {
  const bar = Promise.resolve('bar')

  t.is(await bar, 'bar')
})
