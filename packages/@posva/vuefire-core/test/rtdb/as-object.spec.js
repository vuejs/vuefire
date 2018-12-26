import { rtdbBindAsObject, walkSet } from '../../src'
import { spyUnbind, createOps } from '@posva/vuefire-test-helpers'
import { MockFirebase } from '@posva/vuefire-test-helpers'

function createSnapshotFromPrimitive (value, key) {
  const data = {}
  Object.defineProperty(data, '.value', { value })
  Object.defineProperty(data, '.key', { value: key })
  return data
}

describe('RTDB collection', () => {
  let document, vm, resolve, reject, ops, unbind
  beforeEach(async () => {
    document = new MockFirebase().child('data')
    ops = createOps(walkSet)
    vm = {}
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      unbind = rtdbBindAsObject({
        vm,
        key: 'item',
        document,
        resolve,
        reject,
        ops
      })
      document.flush()
    })
  })

  it('sets a document', () => {
    expect(ops.add).not.toHaveBeenCalled()
    expect(ops.remove).not.toHaveBeenCalled()
    expect(resolve).toHaveBeenCalled()
    expect(reject).not.toHaveBeenCalled()

    expect(ops.set).toHaveBeenLastCalledWith(vm, 'item', {})
    document.set({ foo: 'foo' })
    document.flush()
    expect(ops.set).toHaveBeenLastCalledWith(vm, 'item', { foo: 'foo' })
  })

  it('creates non-enumerable fields with primitive values', () => {
    document.set('foo')
    document.flush()
    expect(ops.set).toHaveBeenLastCalledWith(
      vm,
      'item',
      createSnapshotFromPrimitive('foo', 'data')
    )
    document.set(2)
    document.flush()
    expect(ops.set).toHaveBeenLastCalledWith(
      vm,
      'item',
      createSnapshotFromPrimitive(2, 'data')
    )
  })

  it('rejects when errors', async () => {
    const error = new Error()
    document.forceCancel(error)
    expect(reject).toHaveBeenCalledWith(error)
  })

  it('resolves when the document is set', async () => {
    document.set({ foo: 'foo' })
    document.flush()
    const promise = new Promise((resolve, reject) => {
      rtdbBindAsObject({ vm, document, key: 'other', resolve, reject, ops })
    })
    expect(vm).not.toHaveProperty('other')
    document.flush()
    await promise
    expect(vm.other).toEqual({ foo: 'foo' })
  })

  it('works with nested paths', async () => {
    document.set({ foo: 'foo' })
    document.flush()
    vm.a = {
      b: {
        c: null
      }
    }
    const promise = new Promise((resolve, reject) => {
      rtdbBindAsObject({ vm, document, key: 'a.b.c', resolve, reject, ops })
    })
    document.flush()
    await promise
    expect(vm.a.b.c).toEqual({ foo: 'foo' })
  })

  it('correctly unbinds', () => {
    expect(vm.item).toEqual({})
    unbind()
    document.set({ foo: 'foo' })
    document.flush()
    expect(vm.item).toEqual({})
  })

  it('leaves data intact on unbind', async () => {
    document.set({ foo: 'foo' })
    document.flush()
    unbind()
    expect(vm.item).toEqual({ foo: 'foo' })
    const other = new MockFirebase().child('other')
    other.set({ bar: 'bar' })
    other.flush()
    const promise = new Promise((resolve, reject) => {
      rtdbBindAsObject({
        vm,
        document: other,
        key: 'item',
        resolve,
        reject,
        ops
      })
    })
    expect(vm.item).toEqual({ foo: 'foo' })
    other.flush()
    await promise
    expect(vm.item).toEqual({ bar: 'bar' })
  })
})
