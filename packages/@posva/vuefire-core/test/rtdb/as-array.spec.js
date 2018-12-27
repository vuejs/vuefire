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

  it('reorder elements', async () => {
    collection.push({ value: 3 })
    collection.push({ value: 1 })
    collection.push({ value: 2 })
    collection.flush()

    const originalOn = collection.on
    let childChangedCb = jest.fn()
    const mock = jest
      .spyOn(collection, 'on')
      .mockImplementation((name, ...args) => {
        if (name === 'child_moved') {
          childChangedCb = args[0]
          return
        }
        originalOn.call(collection, name, ...args)
      })

    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      rtdbBindAsArray({
        vm,
        key: 'items',
        collection,
        resolve,
        reject,
        ops
      })
      collection.flush()
    })

    expect(vm.items).toEqual([{ value: 3 }, { value: 1 }, { value: 2 }])

    childChangedCb(
      {
        key: vm.items[0]['.key']
      },
      vm.items[2]['.key']
    )

    expect(vm.items).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }])

    // move to beginning
    childChangedCb(
      {
        key: vm.items[1]['.key']
      },
      null
    )

    expect(vm.items).toEqual([{ value: 2 }, { value: 1 }, { value: 3 }])

    mock.mockClear()
  })

  it('updates an item', () => {
    collection.push({ name: 'foo' })
    collection.flush()
    collection.child(vm.items[0]['.key']).set({ name: 'bar' })
    collection.flush()
    expect(vm.items).toEqual([{ name: 'bar' }])
  })
})
