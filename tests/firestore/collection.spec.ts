import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useCollection } from '../../src'
import { addDoc, collection, DocumentData } from 'firebase/firestore'
import { expectType, setupRefs, tds, firestore } from '../utils'
import { usePendingPromises } from '../../src/vuefire/firestore'
import { type Ref } from 'vue'

describe('Firestore collections', () => {
  const { itemRef, listRef, orderedListRef } = setupRefs()

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
    const db = firestore
    expectType<Ref<DocumentData[]>>(useCollection(collection(db, 'todos')))
    // @ts-expect-error
    expectType<Ref<number[]>>(useCollection(collection(db, 'todos')))

    expectType<Ref<number[]>>(useCollection<number>(collection(db, 'todos')))
    // @ts-expect-error
    expectType<Ref<string[]>>(useCollection<number>(collection(db, 'todos')))

    const refWithConverter = collection(db, 'todos').withConverter<number>({
      toFirestore: data => ({ n: data }),
      fromFirestore: (snap, options) => snap.data(options).n as number,
    })
    expectType<Ref<number[]>>(useCollection(refWithConverter))
    // @ts-expect-error
    expectType<Ref<string[]>>(useCollection(refWithConverter))
  })
})
