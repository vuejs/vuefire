import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  UseDatabaseRefOptions,
  useList,
  VueDatabaseQueryData,
  _RefDatabase,
} from '../../src'
import { expectType, tds, setupDatabaseRefs, database } from '../utils'
import { computed, nextTick, ref, unref, type Ref } from 'vue'
import {
  DatabaseReference,
  Query,
  ref as _databaseRef,
} from 'firebase/database'
import { _MaybeRef } from '../../src/shared'

describe('Database lists', () => {
  const { databaseRef, push, set, remove, update } = setupDatabaseRefs()

  function factory<T = unknown>({
    options,
    ref = databaseRef(),
  }: {
    options?: UseDatabaseRefOptions
    ref?: _MaybeRef<DatabaseReference | Query>
  } = {}) {
    let data!: _RefDatabase<VueDatabaseQueryData<T> | undefined>

    const wrapper = mount({
      template: 'no',
      setup() {
        data = useList(ref, options)
        const { data: list, pending, error, promise, unbind } = data
        return { list, pending, error, promise, unbind }
      },
    })

    return {
      wrapper,
      // to simplify tests
      listRef: unref(ref) as DatabaseReference,
      // non enumerable properties cannot be spread
      data: data.data,
      pending: data.pending,
      error: data.error,
      promise: data.promise,
      unbind: data.unbind,
    }
  }

  it('binds a list', async () => {
    const { wrapper, data, listRef } = factory()

    expect(wrapper.vm.list).toEqual([])

    await push(listRef, { name: 'a' })
    await push(listRef, { name: 'b' })
    await push(listRef, { name: 'c' })
    expect(wrapper.vm.list).toHaveLength(3)
    expect(wrapper.vm.list).toContainEqual({ name: 'a' })
    expect(wrapper.vm.list).toContainEqual({ name: 'b' })
    expect(wrapper.vm.list).toContainEqual({ name: 'c' })
  })

  it('can be bound to a ref of a query', async () => {
    const listA = databaseRef()
    const listB = databaseRef()
    await push(listA, { text: 'task 1' })
    await push(listA, { text: 'task 2' })
    await push(listB, { text: 'task 3' })
    await push(listA, { text: 'task 4' })
    const showFinished = ref(true)
    // Using a query failed when using equalTo(true, 'finished')...
    const listToDisplay = computed(() => (showFinished.value ? listA : listB))

    const { wrapper, data, promise } = factory({
      ref: listToDisplay,
    })

    await promise.value
    expect(data.value).toHaveLength(3)
    expect(data.value).toContainEqual({ text: 'task 1' })
    expect(data.value).toContainEqual({ text: 'task 2' })
    expect(data.value).toContainEqual({ text: 'task 4' })

    showFinished.value = false
    await nextTick()
    await promise.value
    await nextTick()
    expect(data.value).toHaveLength(1)
    expect(data.value).toContainEqual({ text: 'task 3' })
  })

  tds(() => {
    const db = database
    const databaseRef = _databaseRef
    expectType<Ref<unknown[]>>(useList(databaseRef(db, 'todos')))
    expectType<Ref<number[]>>(useList<number>(databaseRef(db, 'todos')))
  })
})
