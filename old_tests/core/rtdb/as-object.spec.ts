import { rtdbBindAsObject } from '../../../src/core'
import { MockFirebase, MockedReference, createOps } from '../../src'
import { ResetOption } from '../../../src/shared'
import { ref, Ref } from 'vue'

function createSnapshotFromPrimitive(value: any, key: string) {
  const data = {}
  Object.defineProperty(data, '.value', { value })
  Object.defineProperty(data, '.key', { value: key })
  return data
}

describe('RTDB document', () => {
  let document: MockedReference,
    target: Ref<Record<string, any>>,
    resolve: (data: any) => void,
    reject: (error: any) => void,
    unbind: () => void
  const ops = createOps()

  beforeEach(async () => {
    document = new MockFirebase().child('data')
    target = ref({})
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      unbind = rtdbBindAsObject({
        target,
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

    expect(ops.set).toHaveBeenLastCalledWith(target, 'value', {})
    document.set({ foo: 'foo' })
    document.flush()
    expect(ops.set).toHaveBeenLastCalledWith(target, 'value', { foo: 'foo' })
  })

  it('creates non-enumerable fields with primitive values', () => {
    document.set('foo')
    document.flush()
    expect(ops.set).toHaveBeenLastCalledWith(
      target,
      'value',
      createSnapshotFromPrimitive('foo', 'data')
    )
    document.set(2)
    document.flush()
    expect(ops.set).toHaveBeenLastCalledWith(
      target,
      'value',
      createSnapshotFromPrimitive(2, 'data')
    )
  })

  it('rejects when errors', async () => {
    const error = new Error()
    const document = new MockFirebase().child('data')
    document.failNext('once', error)
    const target = ref({})
    await expect(
      new Promise((resolve, reject) => {
        unbind = rtdbBindAsObject({
          target,
          document,
          resolve,
          reject,
          ops,
        })
        document.flush()
      })
    ).rejects.toBe(error)
  })

  it('resolves when the document is set', async () => {
    document.set({ foo: 'foo' })
    document.flush()
    const promise = new Promise((resolve, reject) => {
      rtdbBindAsObject({
        target,
        document,
        resolve,
        reject,
        ops,
      })
    })
    expect(target).not.toHaveProperty('other')
    document.flush()
    await promise
    expect(target.value).toEqual({ foo: 'foo' })
  })

  it('resets the value when unbinding', () => {
    expect(target.value).toEqual({})
    unbind()
    document.set({ foo: 'foo' })
    document.flush()
    expect(target.value).toEqual(null)
  })

  it('can be left as is with reset: false', async () => {
    document.set({ foo: 'foo' })
    let unbind: (reset?: ResetOption) => void = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = rtdbBindAsObject({
        target,
        document,
        resolve,
        reject,
        ops,
      })
      document.flush()
    })
    await promise
    expect(target.value).toEqual({ foo: 'foo' })
    unbind(false)
    expect(target.value).toEqual({ foo: 'foo' })
  })

  it('can be reset to a specific value', async () => {
    document.set({ foo: 'foo' })
    let unbind: ReturnType<typeof rtdbBindAsObject> = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = rtdbBindAsObject({
        target,
        document,
        resolve,
        reject,
        ops,
      })
      document.flush()
    })
    await promise
    expect(target.value).toEqual({ foo: 'foo' })
    // not passing anything
    unbind(() => ({ bar: 'bar' }))
    expect(target.value).toEqual({ bar: 'bar' })
  })

  it('ignores reset option in bind when calling unbind', async () => {
    document.set({ foo: 'foo' })
    let unbind: ReturnType<typeof rtdbBindAsObject> = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = rtdbBindAsObject(
        { target, document, resolve, reject, ops },
        // this will have no effect when unbinding
        { reset: () => 'foo' }
      )
      document.flush()
    })
    await promise
    expect(target.value).toEqual({ foo: 'foo' })
    unbind()
    expect(target.value).toEqual(null)
  })
})
