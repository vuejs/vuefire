import { bindDocument, walkSet, firestoreOptions, bindCollection } from '../src'
import { db, createOps } from '@posva/vuefire-test-helpers'

describe('options', () => {
  let collection, document, vm, resolve, reject, ops
  beforeEach(async () => {
    collection = db.collection()
    document = collection.doc()
    ops = createOps(walkSet)
    vm = {}
    await document.update({ foo: 'foo' })
  })

  it('allows customizing serialize when calling bindDocument', async () => {
    const spy = jest.fn(() => ({ bar: 'foo' }))
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      bindDocument(
        { vm, key: 'foo', document, resolve, reject, ops },
        { serialize: spy }
      )
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(
      expect.objectContaining({ data: expect.any(Function) })
    )
    expect(vm.foo).toEqual({ bar: 'foo' })
  })

  it('allows customizing serialize when calling bindCollection', async () => {
    const spy = jest.fn(() => ({ bar: 'foo' }))
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      bindCollection(
        { vm, key: 'foo', collection, resolve, reject, ops },
        { serialize: spy }
      )
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(
      expect.objectContaining({ data: expect.any(Function) })
    )
    expect(vm.foo).toEqual([{ bar: 'foo' }])
  })

  it('can set options globally for bindDocument', async () => {
    const { serialize } = firestoreOptions
    const spy = jest.fn(() => ({ bar: 'foo' }))
    firestoreOptions.serialize = spy
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      bindDocument({ vm, key: 'foo', document, resolve, reject, ops })
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(
      expect.objectContaining({ data: expect.any(Function) })
    )
    expect(vm.foo).toEqual({ bar: 'foo' })
    // restore it
    firestoreOptions.serialize = serialize
  })

  it('can set options globally for bindCollection', async () => {
    const { serialize } = firestoreOptions
    const spy = jest.fn(() => ({ bar: 'foo' }))
    firestoreOptions.serialize = spy
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      bindCollection({ vm, key: 'foo', collection, resolve, reject, ops })
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(
      expect.objectContaining({ data: expect.any(Function) })
    )
    expect(vm.foo).toEqual([{ bar: 'foo' }])
    // restore it
    firestoreOptions.serialize = serialize
  })
})
