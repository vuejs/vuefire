import { rtdbBindAsArray, walkSet } from '../../src'
import { createOps } from '@posva/vuefire-test-helpers'
import { MockFirebase } from '@posva/vuefire-test-helpers'

function createSnapshotFromPrimitive (value, key) {
  const data = {}
  Object.defineProperty(data, '.value', { value })
  Object.defineProperty(data, '.key', { value: key })
  return data
}

describe('RTDB collection', () => {
  let collection, vm, resolve, reject, unbind
  const ops = createOps(walkSet)
  beforeEach(async () => {
    collection = new MockFirebase().child('data')
    vm = {}
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      unbind = rtdbBindAsArray({
        vm,
        key: 'items',
        collection,
        resolve,
        reject,
        ops
      })
      collection.flush()
    })
  })

  it('sets a collection', () => {
    collection.push({ name: 'one' })
    collection.push({ name: 'two' })
    collection.push({ name: 'three' })
    collection.flush()
    expect(vm.items).toEqual([
      { name: 'one' },
      { name: 'two' },
      { name: 'three' }
    ])
  })

  it('removes elements', () => {
    collection.push({ name: 'one' })
    collection.push({ name: 'two' })
    collection.push({ name: 'three' })
    collection.flush()
    collection.child(vm.items[1]['.key']).remove()
    collection.flush()
    expect(vm.items).toEqual([{ name: 'one' }, { name: 'three' }])
  })

  it('stops listening to events when unbound', async () => {
    collection.push({ name: 'one' })
    collection.push({ name: 'two' })
    collection.push({ name: 'three' })
    collection.flush()
    const items = new MockFirebase().child('other')
    items.push({ other: 'one' })
    items.push({ other: 'two' })
    items.push({ other: 'three' })
    items.flush()

    unbind()
    await new Promise((resolve, reject) => {
      rtdbBindAsArray({
        vm,
        key: 'items',
        collection: items,
        resolve,
        reject,
        ops
      })
      items.flush()
    })

    expect(vm.items).toEqual([
      { other: 'one' },
      { other: 'two' },
      { other: 'three' }
    ])
  })

  it.skip('reorder elements', async () => {
    collection.push({ value: 3 })
    collection.push({ value: 1 })
    collection.push({ value: 2 })
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      rtdbBindAsArray({
        vm,
        key: 'items',
        collection: collection.orderByChild('value'),
        resolve,
        reject,
        ops
      })
      collection.flush()
    })

    expect(vm.items).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }])
  })

  it('updates an item', () => {
    collection.push({ name: 'foo' })
    collection.flush()
    collection.child(vm.items[0]['.key']).set({ name: 'bar' })
    collection.flush()
    expect(vm.items).toEqual([{ name: 'bar' }])
  })
})
