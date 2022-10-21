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
} from 'firebase/firestore'
import { expectType, setupFirestoreRefs, tds, firestore } from '../utils'
import { type Ref } from 'vue'

describe('Firestore collections', () => {
  const { collection, query } = setupFirestoreRefs()

  function factory<
    T = unknown,
    K extends CollectionReference<T> | Query<T> = CollectionReference<T>
  >(
    // @ts-expect-error: collection or query
    listRef: K = collection()
  ) {
    const wrapper = mount({
      template: 'no',
      setup() {
        const {
          data: list,
          promise,
          unbind,
          pending,
          error,
        } = useCollection(listRef)

        return { list, promise, unbind, pending, error }
      },
    })

    return { wrapper, listRef }
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

  it('starts the collection as an empty array', async () => {
    const { wrapper } = factory()
    expect(wrapper.vm.list).toEqual([])
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
    const a = await setDoc(aRef, { name: 'a' })
    const bRef = doc(listRef)
    const b = await setDoc(bRef, { name: 'b' })
    const cRef = doc(listRef)
    const c = await setDoc(cRef, { name: 'c' })

    await deleteDoc(aRef)
    expect(wrapper.vm.list).toHaveLength(2)
    expect(wrapper.vm.list).toContainEqual({ name: 'b' })
    expect(wrapper.vm.list).toContainEqual({ name: 'c' })

    await deleteDoc(cRef)
    expect(wrapper.vm.list).toHaveLength(1)
    expect(wrapper.vm.list).toContainEqual({ name: 'b' })
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
