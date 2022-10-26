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
import { computed, nextTick, ref, unref, type Ref } from 'vue'
import { DatabaseReference, ref as _databaseRef } from 'firebase/database'
import { _MaybeRef } from '../../src/shared'

describe('Database lists', () => {
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

  it('binds an object', async () => {
    const { wrapper, itemRef } = factory()

    expect(wrapper.vm.item).toEqual(undefined)

    await set(itemRef, { name: 'a' })
    expect(wrapper.vm.item).toMatchObject({ name: 'a' })
    await update(itemRef, { name: 'b' })
    expect(wrapper.vm.item).toMatchObject({ name: 'b' })
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

  tds(() => {
    const db = database
    const databaseRef = _databaseRef
    expectType<Ref<unknown[]>>(useList(databaseRef(db, 'todos')))
    expectType<Ref<number[]>>(useList<number>(databaseRef(db, 'todos')))
  })
})
