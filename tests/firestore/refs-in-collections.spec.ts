import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  CollectionReference,
  doc as originalDoc,
  DocumentData,
} from 'firebase/firestore'
import { setupFirestoreRefs, sleep } from '../utils'
import { defineComponent, unref } from 'vue'
import { _RefFirestore } from '../../src/firestore'
import {
  useCollection,
  UseCollectionOptions,
  VueFirestoreQueryData,
} from '../../src'
import { _MaybeRef } from '../../src/shared'

describe('Firestore refs in collections', async () => {
  const { collection, query, addDoc, setDoc, updateDoc, deleteDoc, doc } =
    setupFirestoreRefs()

  function factory<T = DocumentData>({
    options,
    ref = collection(),
  }: {
    options?: UseCollectionOptions
    ref?: _MaybeRef<CollectionReference<T>>
  } = {}) {
    let data!: _RefFirestore<VueFirestoreQueryData<T>>

    const wrapper = mount(
      defineComponent({
        template: 'no',
        setup() {
          // @ts-expect-error: generic forced
          data =
            // split for ts
            useCollection(ref, options)
          const { data: list, pending, error, promise, stop } = data
          return { list, pending, error, promise, stop }
        },
      })
    )

    return {
      wrapper,
      listRef: unref(ref),
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

  beforeEach(async () => {
    await setDoc(aRef, { name: 'a' })
    await setDoc(bRef, { name: 'b' })
  })

  it('waits for refs in a collection', async () => {
    const listRef = collection()

    await addDoc(listRef, { ref: aRef })
    await addDoc(listRef, { ref: bRef })

    const { data, promise } = factory({ ref: listRef })

    await promise.value

    expect(data.value).toHaveLength(2)
    expect(data.value).toContainEqual({ ref: { name: 'a' } })
    expect(data.value).toContainEqual({ ref: { name: 'b' } })
  })

  it('bind newly added nested refs', async () => {
    const listRef = collection()

    await addDoc(listRef, { ref: aRef })

    const { data, promise } = factory({ ref: listRef })
    await promise.value
    // should have one item
    await addDoc(listRef, { ref: bRef })
    // wait a bit for the nested ref to be bound
    await sleep(20)
    await promise.value

    expect(data.value).toHaveLength(2)
    expect(data.value).toContainEqual({ ref: { name: 'a' } })
    expect(data.value).toContainEqual({ ref: { name: 'b' } })
  })

  it('subscribe to changes in nested refs', async () => {
    const listRef = collection()

    await addDoc(listRef, { ref: aRef })

    const { data, promise } = factory({ ref: listRef })
    await promise.value
    // should have one item
    await updateDoc(aRef, { name: 'aa' })
    // wait a bit for the nested ref to be bound
    await sleep(20)

    expect(data.value).toHaveLength(1)
    expect(data.value).toContainEqual({ ref: { name: 'aa' } })
  })

  it('unsubscribes from a ref if it is replaced', async () => {
    const listRef = collection()

    const itemRef = await addDoc(listRef, { ref: aRef })

    const { data, promise } = factory({ ref: listRef })
    await promise.value

    await setDoc(itemRef, { ref: bRef })
    // changing the a doc doesn't change the document in listRef
    await setDoc(aRef, { name: 'aaa' })
    // wait a bit for the nested ref to be bound
    await sleep(20)

    expect(data.value).toHaveLength(1)
    expect(data.value).toContainEqual({ ref: { name: 'b' } })
  })

  it('unsubscribes when items are removed', async () => {
    const listRef = collection()

    const itemRef = await addDoc(listRef, { ref: aRef })

    const { data, promise } = factory({ ref: listRef })
    await promise.value

    await deleteDoc(itemRef)
    // changing the a doc doesn't change the document in listRef
    await setDoc(aRef, { name: 'aaa' })
    // wait a bit for the nested ref to be bound
    await sleep(20)

    expect(data.value).toHaveLength(0)
  })

  it('keeps other values in nested refs when they are updated', async () => {
    const listRef = collection()

    await addDoc(listRef, { ref: aRef })

    const { data, promise } = factory({ ref: listRef })
    await promise.value
    // should have one item
    await updateDoc(aRef, { other: 'new' })
    // wait a bit for the nested ref to be bound
    await sleep(20)

    expect(data.value).toHaveLength(1)
    expect(data.value).toContainEqual({ ref: { name: 'a', other: 'new' } })
  })

  it('binds new properties that are refs', async () => {
    const listRef = collection()

    const itemRef = await addDoc(listRef, {})

    const { data, promise } = factory({ ref: listRef })
    await promise.value
    // should have one item
    await updateDoc(itemRef, { ref: aRef })
    // wait a bit for the nested ref to be bound
    await sleep(20)

    expect(data.value).toHaveLength(1)
    expect(data.value).toContainEqual({ ref: { name: 'a' } })
  })

  it('keeps null for non existent docs refs', async () => {
    const listRef = collection()
    const emptyItemRef = doc()
    const itemRef = await addDoc(listRef, { list: [emptyItemRef] })

    const { data, promise } = factory({ ref: listRef })
    await promise.value

    expect(data.value).toEqual([{ list: [null] }])

    await addDoc(listRef, { name: 'c' })

    expect(data.value).toHaveLength(2)
    expect(data.value).toContainEqual({ name: 'c' })
    expect(data.value).toContainEqual({ list: [null] })

    await updateDoc(itemRef, { name: 'd' })

    expect(data.value).toHaveLength(2)
    expect(data.value).toContainEqual({ name: 'c' })
    expect(data.value).toContainEqual({ name: 'd', list: [null] })
  })

  it('can have a max depth of 0', async () => {
    const listRef = collection()

    await addDoc(listRef, { ref: aRef })

    const { data, promise } = factory({
      ref: listRef,
      options: {
        maxRefDepth: 0,
      },
    })
    await promise.value

    expect(data.value).toHaveLength(1)
    expect(data.value).toContainEqual({ ref: expect.any(String) })
  })

  it('does not fail with cyclic refs', async () => {
    const listRef = collection()

    const itemRef = await addDoc(listRef, {})
    await setDoc(itemRef, { ref: itemRef })

    const { data, promise } = factory({ ref: listRef })
    await promise.value

    expect(data.value).toHaveLength(1)
    expect(data.value).toContainEqual({
      // stops at 2
      ref: {
        ref: {
          ref: expect.any(String),
        },
      },
    })
  })
})
