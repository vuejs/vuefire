import { bindDocument, firestoreOptions, bindCollection } from '../../src'
import { db, createOps, CollectionReference, DocumentReference } from '@posva/vuefire-test-helpers'
import { firestore } from 'firebase'

describe('options', () => {
  let collection: firestore.CollectionReference,
    document: firestore.DocumentReference,
    vm: Record<string, any>,
    resolve: (data: any) => void,
    reject: (error: any) => void
  const ops = createOps()

  beforeEach(async () => {
    // @ts-ignore
    collection = db.collection()
    // @ts-ignore
    document = collection.doc()
    vm = {}
    await document.update({ foo: 'foo' })
  })

  it('allows customizing serialize when calling bindDocument', async () => {
    const spy = jest.fn(() => ({ bar: 'foo' }))
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      bindDocument({ vm, key: 'foo', document, resolve, reject, ops }, { serialize: spy })
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(expect.objectContaining({ data: expect.any(Function) }))
    expect(vm.foo).toEqual({ bar: 'foo' })
  })

  it('allows customizing serialize when calling bindCollection', async () => {
    const spy = jest.fn(() => ({ bar: 'foo' }))
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      bindCollection({ vm, key: 'foo', collection, resolve, reject, ops }, { serialize: spy })
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(expect.objectContaining({ data: expect.any(Function) }))
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
    expect(spy).toBeCalledWith(expect.objectContaining({ data: expect.any(Function) }))
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
    expect(spy).toBeCalledWith(expect.objectContaining({ data: expect.any(Function) }))
    expect(vm.foo).toEqual([{ bar: 'foo' }])
    // restore it
    firestoreOptions.serialize = serialize
  })
})
