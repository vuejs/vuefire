import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  addDoc,
  doc as originalDoc,
  DocumentData,
  DocumentReference,
  FirestoreError,
} from 'firebase/firestore'
import {
  expectType,
  setupFirestoreRefs,
  tds,
  firestore,
  firebaseApp,
} from '../utils'
import {
  nextTick,
  ref,
  shallowRef,
  toValue,
  type Ref,
  type MaybeRefOrGetter,
  defineComponent,
} from 'vue'
import { isPOJO, _Nullable } from '../../src/shared'
import {
  useDocument,
  VueFirestoreDocumentData,
  UseDocumentOptions,
  _RefFirestore,
} from '../../src'
import { mockWarn } from '../vitest-mock-warn'
import {
  useSSRInitialState,
  _initialStatesMap,
} from '../../src/ssr/initialState'

describe(
  'Firestore documents',
  () => {
    const { doc, deleteDoc, setDoc, updateDoc } = setupFirestoreRefs()
    mockWarn()

    function factory<T = DocumentData>({
      options,
      ref = doc(),
    }: {
      options?: UseDocumentOptions
      ref?: MaybeRefOrGetter<DocumentReference<T>>
    } = {}) {
      let data!: _RefFirestore<VueFirestoreDocumentData<T>>

      const wrapper = mount(
        defineComponent({
          template: 'no',
          setup() {
            // @ts-expect-error: stricter type
            data =
              // split for ts
              useDocument(ref, options)
            const { data: item, pending, error, promise, stop } = data
            return { item, pending, error, promise, stop }
          },
        })
      )

      return {
        wrapper,
        itemRef: toValue(ref),
        // non enumerable properties cannot be spread
        data: data.data,
        pending: data.pending,
        error: data.error,
        promise: data.promise,
        stop: data.stop,
      }
    }

    beforeEach(() => {
      // delete any ssr state
      _initialStatesMap.delete(firebaseApp)
    })

    it('binds a document', async () => {
      const { wrapper, itemRef, data } = factory()

      await setDoc(itemRef, { name: 'a' })
      expect(wrapper.vm.item).toEqual({ name: 'a' })
      expect(data.value).toEqual({ name: 'a' })
      await updateDoc(itemRef, { name: 'b' })
      expect(wrapper.vm.item).toEqual({ name: 'b' })
      expect(data.value).toEqual({ name: 'b' })
    })

    it('warns if target is the result of useDocument', async () => {
      const target = ref()
      const { data, itemRef } = factory({ options: { target } })

      expect(data).toBe(target)

      expect(() => useDocument(itemRef, { target })).not.toThrow()
      expect(/FAIL/).toHaveBeenWarned()
    })

    it('fetches once', async () => {
      const itemRef = doc<{ name: string }>()
      await setDoc(itemRef, { name: 'a' })
      const { wrapper, data, promise } = factory({
        ref: itemRef,
        options: { once: true },
      })

      await promise.value

      expect(data.value).toEqual({ name: 'a' })
      await updateDoc(itemRef, { name: 'b' })
      expect(wrapper.vm.item).toEqual({ name: 'a' })
      expect(data.value).toEqual({ name: 'a' })
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

    it('sets pending while loading', async () => {
      const itemRef = shallowRef(doc('a'))
      const { pending, promise } = factory({ ref: itemRef })

      expect(pending.value).toBe(true)
      await promise.value
      expect(pending.value).toBe(false)

      // set the target to a new ref so it can be loaded again
      itemRef.value = doc('b')

      await nextTick() // for the watcher to trigger
      expect(pending.value).toBe(true)
      await promise.value
      expect(pending.value).toBe(false)
    })

    it('sets pending to false if there is an initial value (ssr)', async () => {
      const itemRef = shallowRef(doc())
      useSSRInitialState({ f: { a: 1 }, r: {}, s: {}, u: {} }, firebaseApp)
      const { pending, promise } = factory({
        ref: itemRef,
        options: { ssrKey: 'a' },
      })

      expect(pending.value).toBe(false)
      await promise.value
      expect(pending.value).toBe(false)
    })

    it('skips setting pending if the object is an empty ref', async () => {
      const itemRef = shallowRef()
      const { pending, promise } = factory({ ref: itemRef })

      expect(pending.value).toBe(false)
      await promise.value
      expect(pending.value).toBe(false)
    })

    it('manually unbinds a document', async () => {
      const { itemRef, data, stop: unbind } = factory()

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

      await expect(toValue(promise)).resolves.toEqual(expect.anything())
      expect(data.value).toEqual({ name: 'a' })
      expect(error.value).toBeUndefined()
    })

    it('can use a custom converter', async () => {
      class MyName {
        private _name: string
        constructor(name: string) {
          this._name = name
        }

        get name() {
          return this._name
        }

        set name(_newName: string) {
          // do nothing
        }
      }
      const itemRef = doc().withConverter<MyName, DocumentData>({
        toFirestore: (data) => ({ name: data.name }),
        fromFirestore: (snap) => new MyName(snap.get('name')),
      })
      await setDoc(itemRef, new MyName('a'))

      const { wrapper, data, promise } = factory({ ref: itemRef })

      await promise.value

      expect(wrapper.vm.item).toHaveProperty('name', 'a')
      expect(isPOJO(wrapper.vm.item)).toBe(false)

      // should respect the setter
      wrapper.vm.item!.name = 'b'
      expect(wrapper.vm.item).toHaveProperty('name', 'a')
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

    tds(() => {
      const db = firestore
      const doc = originalDoc
      const itemRef = doc(db, 'todos', '1')
      interface TodoI {
        text: string
        finished: boolean
      }

      expectType<Ref<DocumentData | null | undefined>>(useDocument(itemRef))
      // @ts-expect-error
      expectType<Ref<number | null>>(useDocument(itemRef))

      // Adds the id
      // FIXME: this one is any but the test passes
      expectType<string>(useDocument(doc(db, 'todos', '1')).value?.id)
      expectType<string>(useDocument<TodoI>(doc(db, 'todos', '1')).value!.id)
      expectType<_Nullable<TodoI>>(
        useDocument<TodoI>(doc(db, 'todos', '1')).value
      )
      expectType<string>(useDocument<unknown>(doc(db, 'todos', '1')).value!.id)
      useDocument(
        doc(db, 'todos').withConverter<TodoI, DocumentData>({
          fromFirestore: (snapshot) => {
            const data = snapshot.data()
            return { text: data.text, finished: data.finished }
          },
          toFirestore: (todo) => todo,
        })
        // @ts-expect-error: no id with custom converter
      ).value?.id

      expectType<Ref<number | null | undefined>>(useDocument<number>(itemRef))
      expectType<Ref<number | null | undefined>>(
        useDocument<number>(itemRef).data
      )
      // @ts-expect-error
      expectType<Ref<string | null>>(useDocument<number>(itemRef))

      const refWithConverter = itemRef.withConverter<number, DocumentData>({
        toFirestore: (data) => ({ n: data }),
        fromFirestore: (snap, options) => snap.data(options).n as number,
      })
      expectType<Ref<number | number | undefined>>(
        useDocument(refWithConverter)
      )
      expectType<Ref<number | number | undefined>>(
        useDocument(refWithConverter).data
      )
      // should not be null
      useDocument(refWithConverter).value?.toFixed(14)
      // @ts-expect-error: string is not assignable to number
      expectType<Ref<string>>(useDocument(refWithConverter))
      // @ts-expect-error: no id when a custom converter is used
      useDocument(refWithConverter).value.id

      // destructuring
      expectType<Ref<DocumentData | null | undefined>>(
        useDocument(itemRef).data
      )
      expectType<Ref<FirestoreError | undefined>>(useDocument(itemRef).error)
      expectType<Ref<boolean>>(useDocument(itemRef).pending)
    })
  },
  { retry: 3 }
)
