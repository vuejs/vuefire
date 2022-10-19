import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useCollection } from '../../src'
import {
  addDoc,
  collection as originalCollection,
  DocumentData,
  orderBy,
} from 'firebase/firestore'
import { expectType, setupFirestoreRefs, tds, firestore } from '../utils'
import { usePendingPromises } from '../../src/vuefire/firestore'
import { type Ref } from 'vue'

describe('Firestore collections', () => {
  const { collection, query } = setupFirestoreRefs()

  const listRef = collection()
  const orderedListRef = query(listRef, orderBy('name'))

  it('binds a collection as an array', async () => {
    const wrapper = mount(
      {
        template: 'no',
        setup() {
          const list = useCollection(orderedListRef)

          return { list }
        },
      }
      // should work without the plugin
      // { global: { plugins: [firestorePlugin] } }
    )

    expect(wrapper.vm.list).toEqual([])
    await usePendingPromises()

    await addDoc(listRef, { name: 'a' })
    await addDoc(listRef, { name: 'b' })
    await addDoc(listRef, { name: 'c' })
    expect(wrapper.vm.list).toHaveLength(3)
    expect(wrapper.vm.list).toEqual([
      { name: 'a' },
      { name: 'b' },
      { name: 'c' },
    ])
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
