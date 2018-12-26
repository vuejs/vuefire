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
  let collection, vm, resolve, reject, ops, unbind
  beforeEach(async () => {
    collection = new MockFirebase().child('data')
    ops = createOps(walkSet)
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
})
