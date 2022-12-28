import { GeoPoint, getDoc, Timestamp } from 'firebase/firestore'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  extractRefs,
  firestoreDefaultConverter,
} from '../../src/firestore/utils'
import { setupFirestoreRefs } from '../utils'

describe('Firestore and Database utils', () => {
  const { collection, doc, addDoc } = setupFirestoreRefs()

  const collectionRef = collection()

  let docRef = doc()
  beforeEach(async () => {
    // fresh document for each test
    docRef = doc()
  })

  async function addDocToCollection() {
    const forSnapshot = await addDoc(collectionRef, {
      n: 42,
      is: true,
      items: [{ text: 'foo' }],
      ref: docRef,
    })
    return await getDoc(forSnapshot.withConverter(firestoreDefaultConverter))
  }

  it('createSnapshot adds an id', async () => {
    const snapshot = await addDocToCollection()
    expect(snapshot.data()?.id).not.toBeFalsy()
  })

  it('id is not enumerable', async () => {
    const snapshot = await addDocToCollection()
    expect(Object.keys(snapshot.data() ?? {}).includes('id')).toBe(false)
  })

  it('contains all the data', async () => {
    const snapshot = await addDocToCollection()
    expect(snapshot.data()).toEqual({
      n: 42,
      is: true,
      items: [{ text: 'foo' }],
      ref: expect.objectContaining({ path: docRef.path }),
    })
  })

  it('extracts refs from documents', async () => {
    const [noRefsDoc, refs] = extractRefs(
      {
        n: 42,
        is: true,
        items: [{ text: 'foo' }],
        ref: docRef,
      },
      undefined,
      {}
    )
    expect(noRefsDoc.ref).toBe(docRef.path)
    expect(refs).toEqual({
      ref: docRef,
    })
  })

  it('keeps Dates when extracting refs', () => {
    const d = new Date()
    const [doc, refs] = extractRefs(
      {
        foo: 1,
        bar: d,
      },
      undefined,
      {}
    )
    expect(doc.foo).toBe(1)
    expect(doc.bar).toBe(d)
    expect(refs).toEqual({})
  })

  it('keeps Timestamps when extracting refs', () => {
    const d = new Timestamp(10, 10)
    const [doc, refs] = extractRefs(
      {
        foo: 1,
        bar: d,
      },
      undefined,
      {}
    )
    expect(doc.foo).toBe(1)
    expect(doc.bar).toBe(d)
    expect(refs).toEqual({})
  })

  it('keeps GeoPoints when extracting refs', () => {
    const d = new GeoPoint(2, 48)
    const [doc, refs] = extractRefs(
      {
        foo: 1,
        bar: d,
      },
      undefined,
      {}
    )
    expect(doc.foo).toBe(1)
    expect(doc.bar).toBe(d)
    expect(refs).toEqual({})
  })

  it('extract object nested refs from document', () => {
    const [noRefsDoc, refs] = extractRefs(
      {
        obj: {
          ref: docRef,
        },
      },
      undefined,
      {}
    )
    expect(noRefsDoc.obj.ref).toBe(docRef.path)
    expect(refs).toEqual({
      'obj.ref': docRef,
    })
  })

  it('works with null', () => {
    const [noRefsDoc, refs] = extractRefs(
      {
        a: null,
        nested: {
          a: null,
        },
      },
      undefined,
      {}
    )
    expect(noRefsDoc).toEqual({
      a: null,
      nested: {
        a: null,
      },
    })
    expect(refs).toEqual({})
  })

  it('extract deep object nested refs from document', () => {
    const [noRefsDoc, refs] = extractRefs(
      {
        obj: {
          nested: {
            ref: docRef,
          },
        },
      },
      undefined,
      {}
    )
    expect(noRefsDoc.obj.nested.ref).toBe(docRef.path)
    expect(refs).toEqual({
      'obj.nested.ref': docRef,
    })
  })

  it('extracts refs from array', async () => {
    const docRef2 = await addDoc(collectionRef, {})
    const [noRefsDoc, refs] = extractRefs(
      {
        arr: [docRef, docRef2, docRef],
      },
      undefined,
      {}
    )
    expect(noRefsDoc.arr[0]).toBe(docRef.path)
    expect(noRefsDoc.arr[1]).toBe(docRef2.path)
    expect(noRefsDoc.arr[2]).toBe(docRef.path)
    expect(refs).toEqual({
      'arr.0': docRef,
      'arr.1': docRef2,
      'arr.2': docRef,
    })
  })

  it('keeps non enumerable properties', () => {
    const obj = {}
    Object.defineProperty(obj, 'bar', {
      value: 'foo',
      enumerable: false,
    })
    const [noRefsDoc, refs] = extractRefs(obj, undefined, {})
    expect(Object.getOwnPropertyDescriptor(noRefsDoc, 'bar')).toEqual({
      value: 'foo',
      enumerable: false,
      configurable: false,
      writable: false,
    })
    expect(refs).toEqual({})
  })
})
