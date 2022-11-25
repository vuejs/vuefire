import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  UseDatabaseRefOptions,
  useList,
  VueDatabaseQueryData,
  _RefDatabase,
} from '../../src'
import { expectType, tds, setupDatabaseRefs, database } from '../utils'
import { computed, nextTick, ref, unref, watch, type Ref } from 'vue'
import {
  DatabaseReference,
  orderByChild,
  query,
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
    let data!: _RefDatabase<VueDatabaseQueryData<T>>

    const wrapper = mount({
      template: 'no',
      setup() {
        data = useList(ref, options)
        const { data: list, pending, error, promise, stop } = data
        return { list, pending, error, promise, stop }
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
      stop: data.stop,
    }
  }

  it('starts the list as an empty array', async () => {
    const { wrapper } = factory()

    expect(wrapper.vm.list).toEqual([])
  })

  it('fetches once', async () => {
    const listRef = databaseRef()
    await push(listRef, { name: 'a' })
    await push(listRef, { name: 'b' })

    const { wrapper, promise } = factory({
      ref: listRef,
      options: { once: true },
    })

    await promise.value
    expect(wrapper.vm.list).toHaveLength(2)

    await push(listRef, { name: 'c' })
    expect(wrapper.vm.list).toHaveLength(2)
  })

  it('add items to the list', async () => {
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

  it('delete items from the list', async () => {
    const { wrapper, listRef } = factory<{ name: string }>()

    const aRef = await push(listRef, { name: 'a' })
    const bRef = await push(listRef, { name: 'b' })
    const cRef = await push(listRef, { name: 'c' })

    await remove(aRef)
    expect(wrapper.vm.list).toHaveLength(2)
    expect(wrapper.vm.list).toContainEqual({ name: 'b' })
    expect(wrapper.vm.list).toContainEqual({ name: 'c' })

    await remove(cRef)
    expect(wrapper.vm.list).toHaveLength(1)
    expect(wrapper.vm.list).toContainEqual({ name: 'b' })
  })

  it('updates items from the list', async () => {
    const { wrapper, listRef } = factory<{ name: string }>()

    const aRef = await push(listRef, { name: 'a' })
    const bRef = await push(listRef, { name: 'b' })
    const cRef = await push(listRef, { name: 'c' })

    await update(aRef, { name: 'aa' })
    expect(wrapper.vm.list).toHaveLength(3)
    expect(wrapper.vm.list).toContainEqual({ name: 'aa' })
    expect(wrapper.vm.list).toContainEqual({ name: 'b' })
    expect(wrapper.vm.list).toContainEqual({ name: 'c' })

    await update(cRef, { name: 'cc' })
    expect(wrapper.vm.list).toHaveLength(3)
    expect(wrapper.vm.list).toContainEqual({ name: 'aa' })
    expect(wrapper.vm.list).toContainEqual({ name: 'b' })
    expect(wrapper.vm.list).toContainEqual({ name: 'cc' })
  })

  it('adds a non-enumerable id property to the items', async () => {
    const { wrapper, listRef, data } = factory<{ name: string }>()

    const a = await push(listRef, { name: 'a' })
    expect(wrapper.vm.list).toHaveLength(1)
    expect(data.value[0].id).toBeTypeOf('string')
    expect(data.value[0].id).toEqual(a.key)
  })

  it('unbinds when the component is unmounted', async () => {
    const { data, listRef, stop: unbind } = factory()

    await push(listRef, { name: 'a' })

    const copy = [...data.value]
    unbind()
    await push(listRef, { name: 'b' })
    expect(data.value).toEqual(copy)
  })

  describe('reset option', () => {
    it('resets the value when specified', async () => {
      const { wrapper, listRef, data } = factory({
        options: { reset: true },
      })

      await push(listRef, { name: 'a' })
      expect(data.value).toHaveLength(1)
      await wrapper.unmount()
      expect(data.value).toHaveLength(0)
    })

    it('skips resetting by default', async () => {
      const { wrapper, listRef, data } = factory()

      await push(listRef, { name: 'a' })
      expect(data.value).toHaveLength(1)
      await wrapper.unmount()
      expect(data.value).toHaveLength(1)
    })

    it('can be reset to a specific value', async () => {
      const { wrapper, listRef, data } = factory({
        options: { reset: () => 'reset' },
      })

      await push(listRef, { name: 'a' })
      expect(data.value).toHaveLength(1)
      await wrapper.unmount()
      expect(data.value).toEqual('reset')
    })

    it('skips resetting by default when manually reset', async () => {
      const { listRef, data, stop } = factory()

      await push(listRef, { name: 'a' })
      expect(data.value).toHaveLength(1)
      stop()
      expect(data.value).toHaveLength(1)
    })

    it('resets by default when manually reset', async () => {
      const { listRef, data, stop } = factory()

      await push(listRef, { name: 'a' })
      expect(data.value).toHaveLength(1)
      stop(true)
      expect(data.value).toHaveLength(0)
    })

    it('can be reset to a specific value when manually reset', async () => {
      const { listRef, data, stop } = factory()

      await push(listRef, { name: 'a' })
      expect(data.value).toHaveLength(1)
      stop(() => [1])
      expect(data.value).toEqual([1])
    })
  })

  it('awaits before setting the value if wait', async () => {
    const { wrapper, listRef, data } = factory({
      options: {
        wait: true,
        target: ref([{ name: 'old' }]),
      },
    })

    const p = push(listRef, { name: 'a' })
    expect(data.value).toEqual([{ name: 'old' }])
    await p
    expect(data.value).toEqual([{ name: 'a' }])
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

  it('reorders items in the array', async () => {
    const listRef = databaseRef()
    const orderedListRef = query(listRef, orderByChild('n'))
    const a = await push(listRef, { name: 'a', n: 0 })
    const b = await push(listRef, { name: 'b', n: 10 })
    const c = await push(listRef, { name: 'c', n: 20 })
    const { wrapper, data } = factory<{ name: string }>({
      ref: orderedListRef,
    })

    await update(a, { n: 15 })

    // copy to avoid checking hidden properties
    expect([...data.value]).toEqual([
      { name: 'b', n: 10 },
      { name: 'a', n: 15 },
      { name: 'c', n: 20 },
    ])

    // from bottom to top
    await update(c, { n: 5 })
    expect([...data.value]).toEqual([
      { name: 'c', n: 5 },
      { name: 'b', n: 10 },
      { name: 'a', n: 15 },
    ])

    // from top to bottom
    await update(c, { n: 25 })
    expect([...data.value]).toEqual([
      { name: 'b', n: 10 },
      { name: 'a', n: 15 },
      { name: 'c', n: 25 },
    ])

    // from middle to top
    await update(a, { n: 5 })
    expect([...data.value]).toEqual([
      { name: 'a', n: 5 },
      { name: 'b', n: 10 },
      { name: 'c', n: 25 },
    ])
  })

  // TODO:
  it.todo('rejects on error', async () => {
    const { error, promise } = factory({
      ref: _databaseRef(database, 'forbidden'),
    })

    expect(error.value).toBeUndefined()
    await expect(unref(promise)).rejects.toThrow()
    expect(error.value).toBeTruthy()
  })

  it('resolves when the ref is populated', async () => {
    const ref = databaseRef()
    await push(ref, { name: 'a' })
    await push(ref, { name: 'b' })
    const { error, promise, data } = factory({ ref })

    await expect(unref(promise)).resolves.toEqual(expect.anything())
    expect(data.value).toContainEqual({ name: 'a' })
    expect(data.value).toContainEqual({ name: 'b' })
    expect(error.value).toBeUndefined()
  })

  it('can provide a target ref to the composable', async () => {
    const dataRef = databaseRef()
    await push(dataRef, { name: 'a' })
    await push(dataRef, { name: 'b' })
    const target = ref([])
    let changeCount = 0
    watch(
      () => target.value,
      (newData) => {
        changeCount++
      },
      { deep: true, flush: 'sync' }
    )
    const { promise, data } = factory({
      ref: dataRef,
      options: { target },
    })

    await promise.value

    expect(changeCount).toBe(1)
    expect(data.value).toHaveLength(2)
    expect(data.value).toContainEqual({ name: 'a' })
    expect(data.value).toContainEqual({ name: 'b' })
    expect(data.value).toEqual(target.value)

    await push(dataRef, { name: 'c' })
    expect(data.value).toHaveLength(3)
    expect(data.value).toContainEqual({ name: 'a' })
    expect(data.value).toContainEqual({ name: 'b' })
    expect(data.value).toContainEqual({ name: 'c' })
    expect(data.value).toEqual(target.value)
  })

  tds(() => {
    const db = database
    const databaseRef = _databaseRef
    expectType<Ref<unknown[]>>(useList(databaseRef(db, 'todos')))
    expectType<Ref<number[]>>(useList<number>(databaseRef(db, 'todos')))

    // TODO: tests for id field
  })
})
