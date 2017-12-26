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

// This makes sure some tests fail by delaying callbacks
function delayUpdate (ref, time = 0) {
  const onSnapshot = ref.onSnapshot.bind(ref)
  ref.onSnapshot = fn => onSnapshot(async (...args) => {
    await delay(time)
    console.log('I waited for', time)
    fn(...args)
  })
}

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
