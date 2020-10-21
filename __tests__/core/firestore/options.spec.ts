import {
  bindDocument,
  firestoreOptions,
  bindCollection,
} from '../../../src/core'
import { db, createOps } from '../../src'
import { firestore } from 'firebase'
import { Ref, ref } from 'vue'

describe('options', () => {
  let collection: firestore.CollectionReference,
    document: firestore.DocumentReference,
    target: Ref<Record<string, any>>,
    resolve: (data: any) => void,
    reject: (error: any) => void
  const ops = createOps()

  beforeEach(async () => {
    // @ts-ignore
    collection = db.collection()
    // @ts-ignore
    document = collection.doc()
    target = ref({})
    await document.update({ foo: 'foo' })
  })

  it('allows customizing serialize when calling bindDocument', async () => {
    const spy = jest.fn(() => ({ bar: 'foo' }))
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      bindDocument(target, document, ops, resolve, reject, { serialize: spy })
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(
      expect.objectContaining({ data: expect.any(Function) })
    )
    expect(target.value).toEqual({ bar: 'foo' })
  })

  it('allows customizing serialize when calling bindCollection', async () => {
    const spy = jest.fn(() => ({ bar: 'foo' }))
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      bindCollection(target, collection, ops, resolve, reject, {
        serialize: spy,
      })
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(
      expect.objectContaining({ data: expect.any(Function) })
    )
    expect(target.value).toEqual([{ bar: 'foo' }])
  })

  it('can set options globally for bindDocument', async () => {
    const { serialize } = firestoreOptions
    const spy = jest.fn(() => ({ bar: 'foo' }))
    firestoreOptions.serialize = spy
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      bindDocument(target, document, ops, resolve, reject)
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(
      expect.objectContaining({ data: expect.any(Function) })
    )
    expect(target.value).toEqual({ bar: 'foo' })
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
      bindCollection(target, collection, ops, resolve, reject)
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(
      expect.objectContaining({ data: expect.any(Function) })
    )
    expect(target.value).toEqual([{ bar: 'foo' }])
    // restore it
    firestoreOptions.serialize = serialize
  })
})
