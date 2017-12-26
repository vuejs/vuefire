import Vuefire from '../src'
import {
  db,
  tick,
  delay,
  Vue
} from './helpers'

Vue.use(Vuefire)

let vm, collection, a, b
beforeEach(async () => {
  a = db.collection().doc()
  b = db.collection().doc()
  await a.update({ isA: true })
  await b.update({ isB: true })
  collection = db.collection()
  await collection.add({ ref: a })
  await collection.add({ ref: b })

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
  // NOTE wait for refs to update
  await delay(5)

  expect(vm.items).toEqual([
    { ref: { isA: true }},
    { ref: { isB: true }},
    { ref: { isC: true }}
  ])
})
