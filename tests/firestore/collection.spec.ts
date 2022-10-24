import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useCollection } from '../../src'
import {
  addDoc,
  collection as originalCollection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  Query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { expectType, setupFirestoreRefs, tds, firestore } from '../utils'
import { type Ref } from 'vue'
import {
  VueFireQueryData,
  _InferReferenceType,
  _RefFirestore,
} from '../../src/firestore'

describe('Firestore collections', () => {
  const { collection, query } = setupFirestoreRefs()

  function factory<T = DocumentData>() {
    const listRef = collection()
    const useIt = () => useCollection<T>(listRef)
    let data!: ReturnType<typeof useIt>

    const wrapper = mount({
      template: 'no',
      setup() {
        data = useIt()

        return { list: data.data, ...data }
      },
    })

    return { wrapper, listRef, ...data }
  }

  function sortedList<
    A extends Array<Record<any, unknown>>,
    K extends keyof A[any]
  >(list: A, key: K) {
    return list.slice().sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      return typeof aVal === 'string' && typeof bVal === 'string'
        ? aVal.localeCompare(bVal)
        : 0
    })
  }

  // TODO: factory by default returns an unknown, but even then it should include the id

  it('starts the collection as an empty array', async () => {
    const { wrapper, data } = factory()
    expect(wrapper.vm.list).toEqual([])
    expect(data.value).toEqual([])
  })

  it('add items to the collection', async () => {
    const { wrapper, listRef } = factory<{ name: string }>()

    await addDoc(listRef, { name: 'a' })
    await addDoc(listRef, { name: 'b' })
    await addDoc(listRef, { name: 'c' })
    expect(wrapper.vm.list).toHaveLength(3)
    expect(wrapper.vm.list).toContainEqual({ name: 'a' })
    expect(wrapper.vm.list).toContainEqual({ name: 'b' })
    expect(wrapper.vm.list).toContainEqual({ name: 'c' })
  })

  it('delete items from the collection', async () => {
    const { wrapper, listRef } = factory<{ name: string }>()

    const aRef = doc(listRef)
    await setDoc(aRef, { name: 'a' })
    const bRef = doc(listRef)
    await setDoc(bRef, { name: 'b' })
    const cRef = doc(listRef)
    await setDoc(cRef, { name: 'c' })

    await deleteDoc(aRef)
    expect(wrapper.vm.list).toHaveLength(2)
    expect(wrapper.vm.list).toContainEqual({ name: 'b' })
    expect(wrapper.vm.list).toContainEqual({ name: 'c' })

    await deleteDoc(cRef)
    expect(wrapper.vm.list).toHaveLength(1)
    expect(wrapper.vm.list).toContainEqual({ name: 'b' })
  })

  it('updates items of the collection', async () => {
    const { wrapper, listRef } = factory<{ name: string }>()

    const aRef = doc(listRef)
    await setDoc(aRef, { name: 'a' })
    const bRef = doc(listRef)
    await setDoc(bRef, { name: 'b' })
    const cRef = doc(listRef)
    await setDoc(cRef, { name: 'c' })

    await setDoc(aRef, { name: 'aa' })
    await updateDoc(cRef, { name: 'cc' })
    expect(wrapper.vm.list).toHaveLength(3)
    expect(wrapper.vm.list).toContainEqual({ name: 'aa' })
    expect(wrapper.vm.list).toContainEqual({ name: 'b' })
    expect(wrapper.vm.list).toContainEqual({ name: 'cc' })
  })

  it('can add an array with null to the collection', async () => {
    const { wrapper, listRef, data } = factory<{ list: Array<number | null> }>()

    await addDoc(listRef, { list: [2, null] })
    expect(wrapper.vm.list).toHaveLength(1)
    expect(wrapper.vm.list).toContainEqual({ list: [2, null] })
  })

  it('adds a non enumerable id to docs in the collection', async () => {
    const { wrapper, listRef, data } = factory<{ name: string }>()

    const a = await addDoc(listRef, { name: 'a' })
    expect(wrapper.vm.list).toHaveLength(1)
    expect(data.value[0].id).toBeTypeOf('string')
    expect(data.value[0].id).toEqual(a.id)
  })

  tds(() => {
    interface TodoI {
      text: string
      finished: boolean
    }

    const db = firestore
    const collection = originalCollection
    expectType<Ref<DocumentData[]>>(useCollection(collection(db, 'todos')))
    // @ts-expect-error: document data by default
    expectType<Ref<number[]>>(useCollection(collection(db, 'todos')))

    // Adds the id
    expectType<string>(useCollection(collection(db, 'todos')).value[0].id)
    expectType<string>(
      useCollection<TodoI>(collection(db, 'todos')).value[0].id
    )
    expectType<string>(
      useCollection<unknown>(collection(db, 'todos')).value[0].id
    )
    useCollection(
      collection(db, 'todos').withConverter<TodoI>({
        fromFirestore: (snapshot) => {
          const data = snapshot.data()
          return { text: data.text, finished: data.finished }
        },
        toFirestore: (todo) => todo,
      })
      // @ts-expect-error: no id with custom converter
    ).value[0].id

    expectType<Ref<TodoI[]>>(useCollection<TodoI>(collection(db, 'todos')))
    expectType<Ref<TodoI[]>>(useCollection<TodoI>(collection(db, 'todos')).data)
    expectType<string>(
      useCollection<TodoI>(collection(db, 'todos')).value.at(0)!.id
    )
    expectType<string>(
      useCollection<TodoI>(collection(db, 'todos')).data.value.at(0)!.id
    )
    // @ts-expect-error: wrong type
    expectType<Ref<string[]>>(useCollection<TodoI>(collection(db, 'todos')))

    const refWithConverter = collection(db, 'todos').withConverter<number>({
      toFirestore: (data) => ({ n: data }),
      fromFirestore: (snap, options) => snap.data(options).n as number,
    })
    expectType<Ref<number[]>>(useCollection(refWithConverter))
    expectType<Ref<number[]>>(useCollection(refWithConverter).data)
    // @ts-expect-error: no id with converter
    expectType<Ref<number[]>>(useCollection(refWithConverter).data.value.id)
    // @ts-expect-error
    expectType<Ref<string[]>>(useCollection(refWithConverter))
  })
})
