import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  doc as originalDoc,
  DocumentData,
  DocumentReference,
  FirestoreError,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { expectType, setupFirestoreRefs, tds, firestore } from '../utils'
import { unref, type Ref } from 'vue'
import { _MaybeRef } from '../../src/shared'
import {
  useDocument,
  VueFirestoreDocumentData,
  UseDocumentOptions,
  _RefFirestore,
} from '../../src'

describe(
  'Firestore documents',
  () => {
    const { doc } = setupFirestoreRefs()

    function factory<T = DocumentData>({
      options,
      ref = doc(),
    }: {
      options?: UseDocumentOptions
      ref?: _MaybeRef<DocumentReference<T>>
    } = {}) {
      let data!: _RefFirestore<VueFirestoreDocumentData<T>>

      const wrapper = mount({
        template: 'no',
        setup() {
          // @ts-expect-error: stricter type
          data =
            // split for ts
            useDocument(ref, options)
          const { data: item, pending, error, promise, unbind } = data
          return { item, pending, error, promise, unbind }
        },
      })

      return {
        wrapper,
        itemRef: unref(ref),
        // non enumerable properties cannot be spread
        data: data.data,
        pending: data.pending,
        error: data.error,
        promise: data.promise,
        unbind: data.unbind,
      }
    }

    it('binds a document', async () => {
      const { wrapper, itemRef, data } = factory()

      await setDoc(itemRef, { name: 'a' })
      expect(wrapper.vm.item).toEqual({ name: 'a' })
      expect(data.value).toEqual({ name: 'a' })
      await updateDoc(itemRef, { name: 'b' })
      expect(wrapper.vm.item).toEqual({ name: 'b' })
      expect(data.value).toEqual({ name: 'b' })
    })

    tds(() => {
      const db = firestore
      const doc = originalDoc
      const itemRef = doc(db, 'todos', '1')
      expectType<Ref<DocumentData | null>>(useDocument(itemRef))
      // @ts-expect-error
      expectType<Ref<number | null>>(useDocument(itemRef))

      expectType<Ref<number | null>>(useDocument<number>(itemRef))
      expectType<Ref<number | null>>(useDocument<number>(itemRef).data)
      // @ts-expect-error
      expectType<Ref<string | null>>(useDocument<number>(itemRef))

      const refWithConverter = itemRef.withConverter<number>({
        toFirestore: (data) => ({ n: data }),
        fromFirestore: (snap, options) => snap.data(options).n as number,
      })
      expectType<Ref<number>>(useDocument(refWithConverter))
      expectType<Ref<number>>(useDocument(refWithConverter).data)
      // should not be null
      useDocument(refWithConverter).value.toFixed(14)
      // @ts-expect-error: string is not assignable to number
      expectType<Ref<string>>(useDocument(refWithConverter))
      // @ts-expect-error: no id when a custom converter is used
      useDocument(refWithConverter).value.id

      // destructuring
      expectType<Ref<DocumentData | null>>(useDocument(itemRef).data)
      expectType<Ref<FirestoreError | undefined>>(useDocument(itemRef).error)
      expectType<Ref<boolean>>(useDocument(itemRef).pending)
    })
  },
  { retry: 3 }
)
