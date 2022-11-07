import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  doc as originalDoc,
  DocumentData,
  DocumentReference,
  FirestoreError,
} from 'firebase/firestore'
import { expectType, setupFirestoreRefs, tds, firestore } from '../utils'
import { nextTick, shallowRef, unref, type Ref } from 'vue'
import { _MaybeRef } from '../../src/shared'
import {
  useDocument,
  VueFirestoreDocumentData,
  UseDocumentOptions,
  _RefFirestore,
} from '../../src'
import { FirebaseError } from 'firebase/app'

describe(
  'Firestore documents',
  () => {
    const { doc, deleteDoc, setDoc, updateDoc } = setupFirestoreRefs()

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

    it('stays null if document does not exists', async () => {
      const { wrapper, data, promise } = factory()

      await promise.value
      expect(wrapper.vm.item).toBe(null)
      expect(data.value).toBe(null)
    })

    it('becomes null when deleted', async () => {
      const { itemRef, data } = factory()

      await setDoc(itemRef, { name: 'a' })
      expect(data.value).toBeTruthy()
      await deleteDoc(itemRef)
      expect(data.value).toBe(null)
    })

    it('adds a non-enumerable id', async () => {
      const { itemRef, data } = factory()

      await setDoc(itemRef, { name: 'a' })
      expect(data.value!.id).toBe(itemRef.id)
    })

    it('manually unbinds a document', async () => {
      const { itemRef, data, unbind } = factory()

      await setDoc(itemRef, { name: 'a' })
      expect(data.value).toEqual({ name: 'a' })
      unbind()
      await setDoc(itemRef, { name: 'b' })
      // can be set to null based on reset
      expect(data.value).not.toEqual({ name: 'b' })
    })

    it('rejects with errors', async () => {
      const { promise, error } = factory({
        ref: originalDoc(firestore, 'no/rights'),
      })

      await expect(promise.value).rejects.toThrow()
      expect(error.value).toBeTruthy()
    })

    it('resolves when the ref is populated', async () => {
      const itemRef = doc()
      await setDoc(itemRef, { name: 'a' })
      const { promise, error, data } = factory({ ref: itemRef })

      await expect(unref(promise)).resolves.toEqual(expect.anything())
      expect(data.value).toEqual({ name: 'a' })
      expect(error.value).toBeUndefined()
    })

    describe('reset option', () => {
      it('resets the value when specified', async () => {
        const { wrapper, itemRef, data } = factory({
          options: { reset: true },
        })

        await setDoc(itemRef, { name: 'a' })
        expect(data.value).toBeTruthy()
        await wrapper.unmount()
        expect(data.value).toBe(null)
      })

      it('skips resetting by default', async () => {
        const itemRef = doc()
        await setDoc(itemRef, { name: 'a' })
        const { wrapper, data, promise } = factory({ ref: itemRef })
        await promise.value

        expect(data.value).toEqual({ name: 'a' })
        await wrapper.unmount()
        expect(data.value).toEqual({ name: 'a' })
      })

      it('can be reset to a specific value', async () => {
        const itemRef = doc()
        await setDoc(itemRef, { name: 'a' })
        const { wrapper, data, promise } = factory({
          ref: itemRef,
          options: { reset: () => 'reset' },
        })
        await promise.value

        expect(data.value).toEqual({ name: 'a' })
        await wrapper.unmount()
        expect(data.value).toEqual('reset')
      })
    })

    it('can be bound to a ref of a document', async () => {
      const aRef = doc()
      const bRef = doc()
      await setDoc(aRef, { name: 'a' })
      await setDoc(bRef, { name: 'b' })
      const targetRef = shallowRef(bRef)

      const { data, promise } = factory({ ref: targetRef })
      await promise.value

      expect(data.value).toEqual({ name: 'b' })

      targetRef.value = aRef
      await nextTick()
      await promise.value
      expect(data.value).toEqual({ name: 'a' })
    })

    it('can be bound to a null ref', async () => {
      const aRef = doc()
      const bRef = doc()
      await setDoc(aRef, { name: 'a' })
      await setDoc(bRef, { name: 'b' })
      const targetRef = shallowRef()

      const { data, promise } = factory({ ref: targetRef })
      await promise.value

      expect(data.value).toBeFalsy()

      targetRef.value = aRef
      expect(data.value).toBeFalsy()
      await nextTick()
      await promise.value
      expect(data.value).toEqual({ name: 'a' })

      targetRef.value = null
      await nextTick()
      await promise.value
      // it stays the same
      expect(data.value).toEqual({ name: 'a' })

      targetRef.value = bRef
      await nextTick()
      await promise.value
      // it stays the same
      expect(data.value).toEqual({ name: 'b' })
    })

    it('can be set to a null ref', async () => {
      const aRef = doc()
      const bRef = doc()
      await setDoc(aRef, { name: 'a' })
      await setDoc(bRef, { name: 'b' })
      const targetRef = shallowRef()

      const { data, promise } = factory({ ref: targetRef })
      await promise.value

      expect(data.value).toBeFalsy()

      targetRef.value = aRef
      await nextTick()
      await promise.value
      expect(data.value).toEqual({ name: 'a' })
    })

    tds(() => {
      const db = firestore
      const doc = originalDoc
      const itemRef = doc(db, 'todos', '1')
      interface TodoI {
        text: string
        finished: boolean
      }

      expectType<Ref<DocumentData | null>>(useDocument(itemRef))
      // @ts-expect-error
      expectType<Ref<number | null>>(useDocument(itemRef))

      // Adds the id
      // FIXME: this one is any but the test passes
      expectType<string>(useDocument(doc(db, 'todos', '1')).value.id)
      expectType<string>(useDocument<TodoI>(doc(db, 'todos', '1')).value!.id)
      expectType<string>(useDocument<unknown>(doc(db, 'todos', '1')).value!.id)
      useDocument(
        doc(db, 'todos').withConverter<TodoI>({
          fromFirestore: (snapshot) => {
            const data = snapshot.data()
            return { text: data.text, finished: data.finished }
          },
          toFirestore: (todo) => todo,
        })
        // @ts-expect-error: no id with custom converter
      ).value.id

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
