import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, expectTypeOf, it } from 'vitest'
import {
  UseDatabaseRefOptions,
  useDatabaseObject,
  VueDatabaseDocumentData,
  _RefDatabase,
  useSSRInitialState,
} from '../../src'
import {
  expectType,
  tds,
  setupDatabaseRefs,
  database,
  firebaseApp,
} from '../utils'
import {
  computed,
  nextTick,
  ref,
  shallowRef,
  toValue,
  type Ref,
  defineComponent,
  type MaybeRefOrGetter,
} from 'vue'
import { DatabaseReference, get, ref as _databaseRef } from 'firebase/database'
import { _Nullable } from '../../src/shared'
import { mockWarn } from '../vitest-mock-warn'
import { _initialStatesMap } from '../../src/ssr/initialState'

describe('Database objects', () => {
  const { databaseRef, set, update, remove } = setupDatabaseRefs()
  mockWarn()

  function factory<T = unknown>({
    options,
    ref = databaseRef(),
  }: {
    options?: UseDatabaseRefOptions<T>
    ref?: MaybeRefOrGetter<DatabaseReference>
  } = {}) {
    let data!: _RefDatabase<VueDatabaseDocumentData<T> | undefined>

    const wrapper = mount(
      defineComponent({
        template: 'no',
        setup() {
          data = useDatabaseObject(ref, options)
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

  it('binds an object', async () => {
    const { wrapper, itemRef } = factory()

    expect(wrapper.vm.item).toEqual(undefined)

    await set(itemRef, { name: 'a' })
    expect(wrapper.vm.item).toMatchObject({ name: 'a' })
    await update(itemRef, { name: 'b' })
    expect(wrapper.vm.item).toMatchObject({ name: 'b' })
  })

  it('warns if target is the result of another composable', async () => {
    const target = ref()
    const { data, itemRef } = factory({ options: { target } })

    expect(data).toBe(target)

    expect(() => useDatabaseObject(itemRef, { target })).not.toThrow()
    expect(/FAIL/).toHaveBeenWarned()
  })

  it('stays null if it does not exist', async () => {
    const { wrapper, itemRef } = factory()

    await remove(itemRef)
    expect(wrapper.vm.item).toBe(null)
  })

  it('sets pending while loading', async () => {
    const itemRef = shallowRef(databaseRef('a'))
    const { pending, promise } = factory({ ref: itemRef })

    expect(pending.value).toBe(true)
    await promise.value
    expect(pending.value).toBe(false)

    // set the target to a new ref so it can be loaded again
    itemRef.value = databaseRef('b')

    await nextTick() // for the watcher to trigger
    expect(pending.value).toBe(true)
    await promise.value
    expect(pending.value).toBe(false)
  })

  it('sets pending to false if there is an initial value (ssr)', async () => {
    const itemRef = shallowRef(databaseRef())
    useSSRInitialState({ r: { a: 1 }, f: {}, s: {}, u: {} }, firebaseApp)
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

  it('retrieves an object with $value for primitives', async () => {
    const itemRef = databaseRef()
    await set(itemRef, 24)

    const { wrapper, promise } = factory({ ref: itemRef })

    await promise.value

    expect(wrapper.vm.item).toMatchObject({
      $value: 24,
      id: itemRef.key,
    })
  })

  it('keeps arrays as is', async () => {
    const itemRef = databaseRef()
    await set(itemRef, ['a', 'b', 'c'])

    const { wrapper, promise } = factory({ ref: itemRef })

    await promise.value

    expect(wrapper.vm.item).toMatchObject(['a', 'b', 'c'])
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

  // TODO: is it possible to make the forbidden path actually forbidden?
  it.todo('rejects when error', async () => {
    const { promise, error } = factory({
      ref: _databaseRef(database, 'forbidden'),
    })

    // this should output an error but it doesn't
    // figure out what needs to be changed in database.rules.json
    await get(_databaseRef(database, 'forbidden'))
      .then((data) => {
        console.log('resolved', data.val())
      })
      .catch((err) => {
        console.log('catch', err)
      })

    await expect(promise.value).rejects.toThrow()
    expect(error.value).toBeTruthy()
  })

  it('resolves when ready', async () => {
    const item = databaseRef()
    await update(item, { name: 'a' })
    const { promise, data } = factory({ ref: item })

    await expect(promise.value).resolves.toEqual({ name: 'a' })
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

    expectTypeOf(
      useDatabaseObject(databaseRef(db, 'todo')).value!.id
    ).toBeString()

    expectTypeOf(
      useDatabaseObject<number>(databaseRef(db, 'todo'))
    ).toMatchTypeOf<Ref<number | null | undefined>>()

    expectTypeOf(useDatabaseObject(databaseRef(db, 'oh'))).toMatchTypeOf<
      Ref<unknown>
    >()

    expectTypeOf(
      useDatabaseObject<{ name: string }>(databaseRef(db, 'todo'))
    ).toMatchTypeOf<Ref<_Nullable<{ name: string }>>>()

    expectTypeOf(
      useDatabaseObject(databaseRef(db, 'todo'), {
        target: ref<{ name: string }>({ name: 'a' }),
      })
    ).toMatchTypeOf<Ref<_Nullable<{ name: string }>>>()
  })
})
