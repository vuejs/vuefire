import { mount } from '@vue/test-utils'
import { beforeEach, describe, it, expect, afterEach } from 'vitest'
import {
  doc as originalDoc,
  DocumentData,
  DocumentReference,
} from 'firebase/firestore'
import { setupFirestoreRefs, sleep } from '../utils'
import { defineComponent, toValue, MaybeRefOrGetter } from 'vue'
import { VueFirestoreDocumentData, _RefFirestore } from '../../src/firestore'
import { UseDocumentOptions, useDocument } from '../../src'

describe('Firestore refs in documents', async () => {
  const { collection, query, addDoc, setDoc, updateDoc, deleteDoc, doc } =
    setupFirestoreRefs()

  function factory<T = DocumentData>({
    options,
    ref = doc(),
  }: {
    options?: UseDocumentOptions<T>
    ref?: MaybeRefOrGetter<DocumentReference<T>>
  } = {}) {
    let data!: _RefFirestore<VueFirestoreDocumentData<T>>

    const wrapper = mount(
      defineComponent({
        template: 'no',
        setup() {
          // @ts-expect-error: generic forced
          data =
            // split for ts
            useDocument(ref, options)
          const { data: list, pending, error, promise, stop } = data
          return { list, pending, error, promise, stop }
        },
      })
    )

    return {
      wrapper,
      listRef: toValue(ref),
      // non enumerable properties cannot be spread
      data: data.data,
      pending: data.pending,
      error: data.error,
      promise: data.promise,
      stop: data.stop,
    }
  }

  const listOfRefs = collection()
  // NOTE: it doesn't work in tests if it's the same collection but works in dev
  // const listOfRefs = listRef
  const aRef = originalDoc(listOfRefs, 'a')
  const bRef = originalDoc(listOfRefs, 'b')
  const cRef = originalDoc(listOfRefs, 'c')
  const emptyRef = originalDoc(listOfRefs, 'empty')

  beforeEach(async () => {
    await setDoc(aRef, { name: 'a' })
    await setDoc(bRef, { name: 'b' })
    await setDoc(cRef, { name: 'c' })
  })

  afterEach(async () => {
    await deleteDoc(emptyRef)
  })

  it('waits for refs in a document', async () => {
    const docRef = await addDoc(listOfRefs, { a: aRef })
    const { data, pending, promise } = factory({ ref: docRef })

    await promise.value
    expect(data.value).toEqual({
      a: { name: 'a' },
    })
  })

  it('binds newly added refs', async () => {
    const docRef = await addDoc(listOfRefs, { a: aRef })
    const { data, pending, promise } = factory({ ref: docRef })

    await promise.value
    await updateDoc(docRef, { b: bRef })
    await sleep(20)
    await promise.value

    expect(data.value).toEqual({
      a: { name: 'a' },
      b: { name: 'b' },
    })
  })

  it('subscribes to changes in nested refs', async () => {
    const docRef = await addDoc(listOfRefs, { a: aRef })
    const { data, pending, promise } = factory({ ref: docRef })

    await promise.value
    await setDoc(aRef, { b: bRef })
    await sleep(20)
    await promise.value

    expect(data.value).toEqual({
      a: { b: { name: 'b' } },
    })

    await updateDoc(bRef, { name: 'b2' })

    await sleep(20)
    expect(data.value).toEqual({
      a: { b: { name: 'b2' } },
    })
  })

  it('refs are also serialized with the converter', async () => {
    const docRef = await addDoc(listOfRefs, { a: aRef })
    const { data, pending, promise } = factory({ ref: docRef })

    await promise.value
    // NOTE: why does toEqual fail here?
    expect(data.value).toMatchObject({
      id: docRef.id,
      a: { name: 'a', id: aRef.id },
    })
  })

  it('unsubscribes from a ref if it is replaced', async () => {
    const docRef = await addDoc(listOfRefs, { a: aRef })
    const { data, pending, promise } = factory({ ref: docRef })

    await promise.value
    await updateDoc(docRef, { a: 'plain' })
    await updateDoc(aRef, { name: 'a2' })
    await sleep(20)
    await promise.value

    expect(data.value).toEqual({ a: 'plain' })
  })

  it('keeps null for non existing refs', async () => {
    const docRef = await addDoc(listOfRefs, { a: emptyRef })
    const { data, pending, promise } = factory({ ref: docRef })

    await promise.value
    expect(data.value).toEqual({ a: null })

    await setDoc(emptyRef, { name: 'a' })
    await sleep(20)
    expect(data.value).not.toEqual({ a: null })

    await deleteDoc(emptyRef)
    await sleep(20)
    expect(data.value).toEqual({ a: null })
  })

  it('can have a max depth of 0', async () => {
    const docRef = await addDoc(listOfRefs, { a: aRef })
    const { data, pending, promise } = factory({
      ref: docRef,
      options: { maxRefDepth: 0 },
    })

    await promise.value
    expect(data.value).toEqual({ a: aRef.path })
  })

  // https://github.com/vuejs/vuefire/pull/1223
  it('sets the path even if the value was null before', async () => {
    const docRef = await addDoc(listOfRefs, { a: null })
    const { data, pending, promise } = factory({
      ref: docRef,
      options: { maxRefDepth: 0 },
    })

    await promise.value
    expect(data.value).toEqual({ a: null })
    await updateDoc(docRef, { a: aRef })
    expect(data.value).toEqual({ a: aRef.path })
  })

  it('keeps null for non existent docs refs when updating the doc', async () => {
    const docRef = await addDoc(listOfRefs, { a: null })

    const { data, promise } = factory({ ref: docRef })
    await promise.value

    expect(data.value).toEqual({ a: null })

    await updateDoc(docRef, { a: emptyRef })

    expect(data.value).toEqual({ a: null })

    await updateDoc(docRef, { name: 'd' })

    expect(data.value).toEqual({ a: null, name: 'd' })
  })

  it('does not fail with cyclic refs', async () => {
    const docRef = await addDoc(listOfRefs, {})
    await setDoc(docRef, { ref: docRef })
    const { data, pending, promise } = factory({ ref: docRef })

    await promise.value
    expect(data.value).toEqual({
      ref: {
        ref: {
          ref: expect.any(String),
        },
      },
    })
  })

  it('should remove elements from arrays', async () => {
    const docRef = await addDoc(listOfRefs, { a: [aRef, bRef, cRef] })
    const { data, pending, promise } = factory({
      ref: docRef,
      options: { maxRefDepth: 0 },
    })

    await promise.value
    expect(data.value).toEqual({ a: [aRef.path, bRef.path, cRef.path] })
    await updateDoc(docRef, { a: [aRef, cRef] })
    await sleep(20)
    await promise.value

    expect(data.value).toEqual({ a: [aRef.path, cRef.path] })
  })

  it('keeps empty refs when a document is updated', async () => {
    const docRef = await addDoc(listOfRefs, { a: emptyRef, b: 'b' })
    const { data, pending, promise } = factory({ ref: docRef })

    await updateDoc(docRef, { b: 'other' })
    await promise.value

    expect(data.value).toEqual({
      a: null,
      b: 'other',
    })
  })
})
