import Vuefire from '../src'
import {
  db,
  tick,
  delay,
  Vue
} from './helpers'

Vue.use(Vuefire)

let vm, collection, a, b, first, second
beforeEach(async () => {
  a = db.collection().doc()
  b = db.collection().doc()
  await a.update({ isA: true })
  await b.update({ isB: true })
  collection = db.collection()
  first = await collection.add({ ref: a })
  second = await collection.add({ ref: b })

  vm = new Vue({
    data: () => ({
      items: null
    })
  })
  await tick()
})

test('binds refs on collections', async () => {
  await vm.$bind('items', collection)

  // XXX dirty hack until $bind resolves when all refs are bound
  // NOTE should add option for it waitForRefs: true (by default)
  await delay(5)

  expect(vm.items).toEqual([
    { ref: { isA: true }},
    { ref: { isB: true }}
  ])
})

test('binds refs when adding to collection', async () => {
  await vm.$bind('items', collection)
  const c = db.collection().doc()
  await c.update({ isC: true })

  await collection.add({ ref: c })
  await delay(5)

  expect(vm.items).toEqual([
    { ref: { isA: true }},
    { ref: { isB: true }},
    { ref: { isC: true }}
  ])
})
