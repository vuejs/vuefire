import { rtdbBindAsArray } from '../../src'
import { MockFirebase, createOps, MockedReference } from '@posva/vuefire-test-helpers'
import { ResetOption } from '../../src/shared'

describe('RTDB collection', () => {
  let collection: MockedReference,
    vm: Record<string, any>,
    resolve: (data: any) => void,
    reject: (error: any) => void,
    unbind: ReturnType<typeof rtdbBindAsArray>
  const ops = createOps()

  beforeEach(async () => {
    collection = new MockFirebase().child('data')
    vm = {}
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      unbind = rtdbBindAsArray({
        vm,
        key: 'items',
        collection,
        resolve,
        reject,
        ops,
      })
      collection.flush()
    })
  })

  it('sets a collection', () => {
    collection.push({ name: 'one' })
    collection.push({ name: 'two' })
    collection.push({ name: 'three' })
    collection.flush()
    expect(vm.items).toEqual([{ name: 'one' }, { name: 'two' }, { name: 'three' }])
  })

  it('removes elements', () => {
    collection.push({ name: 'one' })
    collection.push({ name: 'two' })
    collection.push({ name: 'three' })
    collection.flush()
    collection.child(vm.items[1]['.key']).remove()
    collection.flush()
    expect(vm.items).toEqual([{ name: 'one' }, { name: 'three' }])
  })

  it('stops listening to events when unbound', async () => {
    collection.push({ name: 'one' })
    collection.push({ name: 'two' })
    collection.push({ name: 'three' })
    collection.flush()
    const items = new MockFirebase().child('other')
    items.push({ other: 'one' })
    items.push({ other: 'two' })
    items.push({ other: 'three' })
    items.flush()

    unbind()
    await new Promise((resolve, reject) => {
      rtdbBindAsArray({
        vm,
        key: 'items',
        collection: items,
        resolve,
        reject,
        ops,
      })
      items.flush()
    })

    expect(vm.items).toEqual([{ other: 'one' }, { other: 'two' }, { other: 'three' }])
  })

  it('reorder elements', async () => {
    collection.push({ value: 3 })
    collection.push({ value: 1 })
    collection.push({ value: 2 })
    collection.flush()

    const originalOn = collection.on
    let childChangedCb = jest.fn()
    const mock = jest.spyOn(collection, 'on').mockImplementation(
      // @ts-ignore
      (name, ...args) => {
        if (name === 'child_moved') {
          // @ts-ignore
          childChangedCb = args[0]
          return
        }
        originalOn.call(collection, name, ...args)
      }
    )

    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      rtdbBindAsArray({
        vm,
        key: 'items',
        collection,
        resolve,
        reject,
        ops,
      })
      collection.flush()
    })

    expect(vm.items).toEqual([{ value: 3 }, { value: 1 }, { value: 2 }])

    childChangedCb(
      {
        key: vm.items[0]['.key'],
      },
      vm.items[2]['.key']
    )

    expect(vm.items).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }])

    // move to beginning
    childChangedCb(
      {
        key: vm.items[1]['.key'],
      },
      null
    )

    expect(vm.items).toEqual([{ value: 2 }, { value: 1 }, { value: 3 }])

    mock.mockClear()
  })

  it('updates an item', () => {
    collection.push({ name: 'foo' })
    collection.flush()
    collection.child(vm.items[0]['.key']).set({ name: 'bar' })
    collection.flush()
    expect(vm.items).toEqual([{ name: 'bar' }])
  })

  it('resets the value when unbinding', () => {
    collection.push({ name: 'foo' })
    collection.flush()
    expect(vm.items).toEqual([{ name: 'foo' }])
    unbind()
    expect(vm.items).toEqual([])
  })

  it('can be left as is reset: false', async () => {
    let unbind: (reset?: ResetOption) => void = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = rtdbBindAsArray({ vm, collection, key: 'itemsReset', resolve, reject, ops })
      collection.flush()
    })
    await promise
    collection.push({ foo: 'foo' })
    collection.flush()
    expect(vm.itemsReset).toEqual([{ foo: 'foo' }])
    unbind(false)
    expect(vm.itemsReset).toEqual([{ foo: 'foo' }])
  })

  it('can be reset to a specific value', async () => {
    let unbind: ReturnType<typeof rtdbBindAsArray> = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = rtdbBindAsArray({ vm, collection, key: 'itemsReset', resolve, reject, ops })
      collection.flush()
    })
    await promise
    collection.push({ foo: 'foo' })
    collection.flush()
    expect(vm.itemsReset).toEqual([{ foo: 'foo' }])
    unbind(() => [{ bar: 'bar' }])
    expect(vm.itemsReset).toEqual([{ bar: 'bar' }])
  })

  it('ignores reset option in bind when calling unbind', async () => {
    let unbind: ReturnType<typeof rtdbBindAsArray> = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = rtdbBindAsArray(
        { vm, collection, key: 'itemsReset', resolve, reject, ops },
        // will have no effect when unbinding
        { reset: () => ['Foo'] }
      )
      collection.flush()
    })
    await promise
    collection.push({ foo: 'foo' })
    collection.flush()
    unbind()
    expect(vm.itemsReset).toEqual([])
  })

  it('can wait until ready', async () => {
    collection.push({ name: 'one' })
    collection.push({ name: 'two' })
    collection.flush()

    const other = new MockFirebase().child('other')

    expect(vm.items).toEqual([{ name: 'one' }, { name: 'two' }])

    // force the unbind without resetting the value
    unbind(false)
    const promise = new Promise((resolve, reject) => {
      rtdbBindAsArray(
        {
          vm,
          key: 'items',
          collection: other,
          resolve,
          reject,
          ops,
        },
        { wait: true }
      )
    })

    expect(vm.items).toEqual([{ name: 'one' }, { name: 'two' }])
    other.flush()
    await promise
    expect(vm.items).toEqual([])

    other.push({ other: 'one' })
    other.push({ other: 'two' })
    other.flush()

    expect(vm.items).toEqual([{ other: 'one' }, { other: 'two' }])
  })

  it('can wait until ready with empty arrays', async () => {
    expect(vm.items).toEqual([])

    const other = new MockFirebase().child('other')
    other.push({ a: 0 })
    other.push({ b: 1 })
    other.flush()

    unbind(false)
    const promise = new Promise((resolve, reject) => {
      rtdbBindAsArray(
        {
          vm,
          key: 'items',
          collection: other,
          resolve,
          reject,
          ops,
        },
        { wait: true }
      )
    })

    expect(vm.items).toEqual([])
    other.flush()
    await promise
    expect(vm.items).toEqual([{ a: 0 }, { b: 1 }])
  })
})
