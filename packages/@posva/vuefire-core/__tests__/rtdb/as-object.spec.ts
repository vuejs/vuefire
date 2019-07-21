import { rtdbBindAsObject } from '../../src/index'
import { MockFirebase, MockedReference, createOps } from '@posva/vuefire-test-helpers'

function createSnapshotFromPrimitive(value: any, key: string) {
  const data = {}
  Object.defineProperty(data, '.value', { value })
  Object.defineProperty(data, '.key', { value: key })
  return data
}

describe('RTDB document', () => {
  let document: MockedReference,
    vm: Record<string, any>,
    resolve: (data: any) => void,
    reject: (error: any) => void,
    unbind: () => void
  const ops = createOps()

  beforeEach(async () => {
    document = new MockFirebase().child('data')
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
        ops,
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
    expect(ops.set).toHaveBeenLastCalledWith(vm, 'item', createSnapshotFromPrimitive('foo', 'data'))
    document.set(2)
    document.flush()
    expect(ops.set).toHaveBeenLastCalledWith(vm, 'item', createSnapshotFromPrimitive(2, 'data'))
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
        c: null,
      },
    }
    const promise = new Promise((resolve, reject) => {
      rtdbBindAsObject({ vm, document, key: 'a.b.c', resolve, reject, ops })
    })
    document.flush()
    await promise
    expect(vm.a.b.c).toEqual({ foo: 'foo' })
  })

  it('resets the value when unbinding', () => {
    expect(vm.item).toEqual({})
    unbind()
    document.set({ foo: 'foo' })
    document.flush()
    expect(vm.item).toEqual(null)
  })

  it('can be left as is', async () => {
    document.set({ foo: 'foo' })
    let unbind: () => void = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = rtdbBindAsObject(
        { vm, document, key: 'item', resolve, reject, ops },
        { reset: false }
      )
      document.flush()
    })
    await promise
    expect(vm.item).toEqual({ foo: 'foo' })
    unbind()
    expect(vm.item).toEqual({ foo: 'foo' })
  })

  it('can be reset to a specific value', async () => {
    document.set({ foo: 'foo' })
    let unbind: () => void = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = rtdbBindAsObject(
        { vm, document, key: 'item', resolve, reject, ops },
        { reset: () => ({ bar: 'bar' }) }
      )
      document.flush()
    })
    await promise
    expect(vm.item).toEqual({ foo: 'foo' })
    unbind()
    expect(vm.item).toEqual({ bar: 'bar' })
  })

  it('can override reset option in unbind', async () => {
    document.set({ foo: 'foo' })
    let unbind: ReturnType<typeof rtdbBindAsObject> = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = rtdbBindAsObject(
        { vm, document, key: 'item', resolve, reject, ops },
        { reset: false }
      )
      document.flush()
    })
    await promise
    expect(vm.item).toEqual({ foo: 'foo' })
    unbind(() => 'foo')
    expect(vm.item).toEqual('foo')
  })
})
