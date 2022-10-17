import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useDocument } from '../../src'
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { expectType, setupFirestoreRefs, tds, firestore } from '../utils'
import { usePendingPromises } from '../../src/vuefire/firestore'
import { type Ref } from 'vue'

describe('Firestore collections', () => {
  const { itemRef, listRef, orderedListRef } = setupFirestoreRefs()

  it('binds a collection as an array', async () => {
    const wrapper = mount(
      {
        template: 'no',
        setup() {
          const item = useDocument(itemRef)

          return { item }
        },
      }
      // should work without the plugin
      // { global: { plugins: [firestorePlugin] } }
    )

    expect(wrapper.vm.item).toEqual(null)
    await usePendingPromises()
    expect(wrapper.vm.item).toEqual(null)

    await setDoc(itemRef, { name: 'a' })
    expect(wrapper.vm.item).toMatchObject({
      name: 'a',
    })
    await updateDoc(itemRef, { name: 'b' })
    expect(wrapper.vm.item).toMatchObject({
      name: 'b',
    })
  })

  tds(() => {
    const db = firestore
    const itemRef = doc(db, 'todos', '1')
    expectType<Ref<DocumentData | null>>(useDocument(itemRef))
    // @ts-expect-error
    expectType<Ref<number | null>>(useDocument(itemRef))

    expectType<Ref<number | null>>(useDocument<number>(itemRef))
    // @ts-expect-error
    expectType<Ref<string | null>>(useDocument<number>(itemRef))

    const refWithConverter = itemRef.withConverter<number>({
      toFirestore: data => ({ n: data }),
      fromFirestore: (snap, options) => snap.data(options).n as number,
    })
    expectType<Ref<number | null>>(useDocument(refWithConverter))
    // @ts-expect-error
    expectType<Ref<string | null>>(useDocument(refWithConverter))

    // destructuring
    expectType<Ref<DocumentData | null>>(useDocument(itemRef).data)
    expectType<Ref<Error | undefined>>(useDocument(itemRef).error)
    expectType<Ref<boolean>>(useDocument(itemRef).pending)
  })
})
