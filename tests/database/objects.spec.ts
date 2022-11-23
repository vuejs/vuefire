import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  UseDatabaseRefOptions,
  useList,
  useObject,
  VueDatabaseDocumentData,
  _RefDatabase,
} from '../../src'
import { expectType, tds, setupDatabaseRefs, database } from '../utils'
import { computed, nextTick, ref, shallowRef, unref, type Ref } from 'vue'
import { DatabaseReference, ref as _databaseRef } from 'firebase/database'
import { _MaybeRef, _Nullable } from '../../src/shared'

describe('Database objects', () => {
  const { databaseRef, set, update, remove } = setupDatabaseRefs()

  function factory<T = unknown>({
    options,
    ref = databaseRef(),
  }: {
    options?: UseDatabaseRefOptions
    ref?: _MaybeRef<DatabaseReference>
  } = {}) {
    let data!: _RefDatabase<VueDatabaseDocumentData<T> | undefined>

    const wrapper = mount({
      template: 'no',
      setup() {
        data = useObject(ref, options)
        const { data: item, pending, error, promise, stop } = data
        return { item, pending, error, promise, stop }
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
      stop: data.stop,
    }
  }

  it('binds an object', async () => {
    const { wrapper, itemRef } = factory()

    expect(wrapper.vm.item).toEqual(undefined)

    await set(itemRef, { name: 'a' })
    expect(wrapper.vm.item).toMatchObject({ name: 'a' })
    await update(itemRef, { name: 'b' })
    expect(wrapper.vm.item).toMatchObject({ name: 'b' })
  })

  // TODO: right now this creates an object with a .value property equal to null
  it.todo('stays null if it does not exist', async () => {
    const { wrapper, itemRef } = factory()

    expect(wrapper.vm.item).toEqual(undefined)

    await remove(itemRef)
    expect(wrapper.vm.item).toEqual(undefined)
  })

  it('fetches once', async () => {
    const itemRef = databaseRef()
    await set(itemRef, { name: 'a' })
    const { wrapper, promise } = factory({
      ref: itemRef,
      options: { once: true },
    })

    await promise.value

    expect(wrapper.vm.item).toEqual({ name: 'a' })

    await set(itemRef, { name: 'b' })
    expect(wrapper.vm.item).toEqual({ name: 'a' })
  })

  it('can be bound to a Vue ref', async () => {
    const aRef = databaseRef()
    const bRef = databaseRef()
    const showA = ref(true)
    const currentRef = computed(() => (showA.value ? aRef : bRef))
    await set(aRef, { name: 'a' })
    await set(bRef, { name: 'b' })

    const { wrapper, data, promise } = factory({
      ref: currentRef,
    })

    await promise.value
    expect(data.value).toEqual({ name: 'a' })

    showA.value = false
    await nextTick()
    await promise.value
    await nextTick()
    expect(data.value).toEqual({ name: 'b' })
  })

  it('can be bound to a ref of a document', async () => {
    const { wrapper, data } = factory({})

    expect(wrapper.vm.item).toEqual(undefined)
  })

  // TODO: not implemented yet
  it.todo('rejects when error', async () => {
    const { promise, error } = factory({
      ref: _databaseRef(database, 'forbidden'),
    })

    await expect(promise.value).rejects.toThrow()
    expect(error.value).toBeTruthy()
  })

  // TODO:
  it.todo('resolves when ready', async () => {
    const item = databaseRef()
    await update(item, { name: 'a' })
    const { promise, data } = factory({ ref: item })

    await expect(promise.value).resolves
    expect(data.value).toEqual({ name: 'a' })
  })

  it('can be bound to a null ref', async () => {
    const aRef = databaseRef()
    const bRef = databaseRef()
    await set(aRef, { name: 'a' })
    await set(bRef, { name: 'b' })
    const targetRef = shallowRef()

    const { data, promise } = factory({ ref: targetRef })
    await promise.value

    expect(data.value).toBeFalsy()

    targetRef.value = aRef
    await nextTick()
    await promise.value
    expect(data.value).toEqual({ name: 'a' })
  })

  describe('reset option', () => {
    it('resets the value when specified', async () => {
      const { wrapper, itemRef, data } = factory({
        options: { reset: true },
      })

      await set(itemRef, { name: 'a' })
      expect(data.value).toBeTruthy()
      await wrapper.unmount()
      expect(data.value).toBe(null)
    })

    it('skips resetting by default', async () => {
      const { wrapper, itemRef, data } = factory()

      await set(itemRef, { name: 'a' })
      expect(data.value).toEqual({ name: 'a' })
      await wrapper.unmount()
      expect(data.value).toEqual({ name: 'a' })
    })

    it('can be reset to a specific value', async () => {
      const { wrapper, itemRef, data } = factory({
        options: { reset: () => 'reset' },
      })

      await set(itemRef, { name: 'a' })
      expect(data.value).toEqual({ name: 'a' })
      await wrapper.unmount()
      expect(data.value).toEqual('reset')
    })
  })

  tds(() => {
    const db = database
    const databaseRef = _databaseRef
    expectType<Ref<unknown[]>>(useList(databaseRef(db, 'todos')))
    expectType<Ref<number[]>>(useList<number>(databaseRef(db, 'todos')))
  })
})
