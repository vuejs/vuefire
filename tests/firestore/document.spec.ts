import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useDocument } from '../../src'
import {
  doc as originalDoc,
  DocumentData,
  FirestoreError,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { expectType, setupFirestoreRefs, tds, firestore } from '../utils'
import { type Ref } from 'vue'

describe('Firestore documents', () => {
  const { doc } = setupFirestoreRefs()
  const itemRef = doc()

  it('binds a document', async () => {
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
    const doc = originalDoc
    const itemRef = doc(db, 'todos', '1')
    expectType<Ref<DocumentData | null>>(useDocument(itemRef))
    // @ts-expect-error
    expectType<Ref<number | null>>(useDocument(itemRef))

    expectType<Ref<number | null>>(useDocument<number>(itemRef))
    // @ts-expect-error
    expectType<Ref<string | null>>(useDocument<number>(itemRef))

    const refWithConverter = itemRef.withConverter<number>({
      toFirestore: (data) => ({ n: data }),
      fromFirestore: (snap, options) => snap.data(options).n as number,
    })
    expectType<Ref<number | null>>(useDocument(refWithConverter))
    // @ts-expect-error
    expectType<Ref<string | null>>(useDocument(refWithConverter))

    // destructuring
    expectType<Ref<DocumentData | null>>(useDocument(itemRef).data)
    expectType<Ref<FirestoreError | undefined>>(useDocument(itemRef).error)
    expectType<Ref<boolean>>(useDocument(itemRef).pending)
  })
})
