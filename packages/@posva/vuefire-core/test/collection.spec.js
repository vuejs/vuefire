import { bindCollection, walkSet } from '../src'
import { db, createOps } from '@posva/vuefire-test-helpers'

describe('collections', () => {
  let collection, vm, resolve, reject, ops
  beforeEach(async () => {
    collection = db.collection()
    ops = createOps(walkSet)
    vm = {}
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      bindCollection({ vm, key: 'items', collection, resolve, reject, ops })
    })
  })

  it('initialise the array', () => {
    expect(ops.set).toHaveBeenCalledTimes(1)
    expect(ops.set).toHaveBeenCalledWith(vm, 'items', [])
  })

  it('add elements', async () => {
    await collection.add({ text: 'foo' })
    expect(ops.add).toHaveBeenCalledTimes(1)
    expect(ops.add).toHaveBeenLastCalledWith(vm.items, 0, { text: 'foo' })
    await collection.add({ text: 'bar' })
    expect(ops.add).toHaveBeenCalledTimes(2)
    expect(ops.add).toHaveBeenLastCalledWith(vm.items, 1, { text: 'bar' })
  })

  it('deletes items', async () => {
    await collection.add({ text: 'foo' })
    await collection.doc(vm.items[0].id).delete()
    expect(ops.remove).toHaveBeenCalledTimes(1)
    expect(ops.remove).toHaveBeenLastCalledWith(vm.items, 0)
  })

  it('update items', async () => {
    const doc = await collection.add({ text: 'foo', more: true })
    await doc.update({ text: 'bar' })
    expect(ops.set).toHaveBeenCalledTimes(1)
    expect(ops.set).toHaveBeenLastCalledWith(vm, 'items', [{ more: true, text: 'bar' }])
  })

  it('add properties', async () => {
    const doc = await collection.add({ text: 'foo' })
    await doc.update({ other: 'bar' })
    expect(ops.set).toHaveBeenCalledTimes(1)
    expect(ops.set).toHaveBeenLastCalledWith(vm, 'items', [{ other: 'bar', text: 'foo' }])
  })

  // TODO move to vuefire
  it.skip('unbinds when the instance is destroyed', async () => {
    expect(vm._firestoreUnbinds).toBeTruthy()
    expect(vm.items).toEqual([])
    const spy = jest.spyOn(vm._firestoreUnbinds, 'items')
    expect(() => {
      vm.$destroy()
    }).not.toThrow()
    expect(spy).toHaveBeenCalled()
    expect(vm._firestoreUnbinds).toBe(null)
    await expect(async () => {
      await collection.add({ text: 'foo' })
      expect(vm.items).toEqual([])
    }).not.toThrow()
  })

  it('adds non-enumerable id', async () => {
    const a = await collection.doc('u0')
    const b = await collection.doc('u1')
    await a.update({})
    await b.update({})
    expect(vm.items.length).toBe(2)
    vm.items.forEach((item, i) => {
      expect(Object.getOwnPropertyDescriptor(item, 'id')).toEqual({
        configurable: false,
        enumerable: false,
        writable: false,
        value: `u${i}`,
      })
    })
  })
})
