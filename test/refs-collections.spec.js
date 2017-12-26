import Vuefire from '../src'
import {
  db,
  tick,
  delay,
  delayUpdate,
  spyUnbind,
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

  expect(vm.items).toEqual([
    { ref: { isA: true }},
    { ref: { isB: true }}
  ])
})

test('waits for array to be fully populated', async () => {
  const c = db.collection().doc()
  await c.update({ isC: true })
  await collection.add({ ref: c })
  // force callback delay
  delayUpdate(c)
  const data = await vm.$bind('items', collection)

  expect(data).toEqual(vm.items)
  expect(vm.items).toEqual([
    { ref: { isA: true }},
    { ref: { isB: true }},
    { ref: { isC: true }}
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

test('unbinds refs when the collection is unbound', async () => {
  const items = db.collection()
  const spyA = spyUnbind(a)
  const spyB = spyUnbind(b)
  await items.add({ ref: a })
  await items.add({ ref: b })
  await vm.$bind('items', items)

  expect(spyA).toHaveBeenCalledTimes(0)
  expect(spyB).toHaveBeenCalledTimes(0)

  vm.$unbind('items')

  expect(spyA).toHaveBeenCalledTimes(1)
  expect(spyB).toHaveBeenCalledTimes(1)

  spyA.mockRestore()
  spyB.mockRestore()
})

test('unbinds nested refs when the collection is unbound', async () => {
  const items = db.collection()
  const spyA = spyUnbind(a)
  await items.add({ ref: { ref: a }})
  await vm.$bind('items', items)

  expect(spyA).toHaveBeenCalledTimes(0)

  vm.$unbind('items')

  expect(spyA).toHaveBeenCalledTimes(1)

  spyA.mockRestore()
})
