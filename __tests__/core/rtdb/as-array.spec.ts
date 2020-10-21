import { rtdbBindAsArray } from '../../../src/core'
import { MockFirebase, createOps, MockedReference } from '../../src'
import { ResetOption } from '../../../src/shared'
import { ref, Ref } from 'vue'

describe('RTDB collection', () => {
  let collection: MockedReference,
    target: Ref<Record<string, any>>,
    resolve: (data: any) => void,
    reject: (error: any) => void,
    unbind: ReturnType<typeof rtdbBindAsArray>
  const ops = createOps()

  beforeEach(async () => {
    collection = new MockFirebase().child('data')
    target = ref([])
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      unbind = rtdbBindAsArray({
        target,
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
    expect(target.value).toEqual([
      { name: 'one' },
      { name: 'two' },
      { name: 'three' },
    ])
  })

  it('removes elements', () => {
    collection.push({ name: 'one' })
    collection.push({ name: 'two' })
    collection.push({ name: 'three' })
    collection.flush()
    collection.child(target.value[1]['.key']).remove()
    collection.flush()
    expect(target.value).toEqual([{ name: 'one' }, { name: 'three' }])
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
        target,
        collection: items,
        resolve,
        reject,
        ops,
      })
      items.flush()
    })

    expect(target.value).toEqual([
      { other: 'one' },
      { other: 'two' },
      { other: 'three' },
    ])
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
        target,
        collection,
        resolve,
        reject,
        ops,
      })
      collection.flush()
    })

    expect(target.value).toEqual([{ value: 3 }, { value: 1 }, { value: 2 }])

    childChangedCb(
      {
        key: target.value[0]['.key'],
      },
      target.value[2]['.key']
    )

    expect(target.value).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }])

    // move to beginning
    childChangedCb(
      {
        key: target.value[1]['.key'],
      },
      null
    )

    expect(target.value).toEqual([{ value: 2 }, { value: 1 }, { value: 3 }])

    mock.mockClear()
  })

  it('updates an item', () => {
    collection.push({ name: 'foo' })
    collection.flush()
    collection.child(target.value[0]['.key']).set({ name: 'bar' })
    collection.flush()
    expect(target.value).toEqual([{ name: 'bar' }])
  })

  it('resets the value when unbinding', () => {
    collection.push({ name: 'foo' })
    collection.flush()
    expect(target.value).toEqual([{ name: 'foo' }])
    unbind()
    expect(target.value).toEqual([])
  })

  it('can be left as is reset: false', async () => {
    let unbind: (reset?: ResetOption) => void = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = rtdbBindAsArray({
        target,
        collection,
        resolve,
        reject,
        ops,
      })
      collection.flush()
    })
    await promise
    collection.push({ foo: 'foo' })
    collection.flush()
    expect(target.value).toEqual([{ foo: 'foo' }])
    unbind(false)
    expect(target.value).toEqual([{ foo: 'foo' }])
  })

  it('can be reset to a specific value', async () => {
    let unbind: ReturnType<typeof rtdbBindAsArray> = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = rtdbBindAsArray({
        target,
        collection,
        resolve,
        reject,
        ops,
      })
      collection.flush()
    })
    await promise
    collection.push({ foo: 'foo' })
    collection.flush()
    expect(target.value).toEqual([{ foo: 'foo' }])
    unbind(() => [{ bar: 'bar' }])
    expect(target.value).toEqual([{ bar: 'bar' }])
  })

  it('ignores reset option in bind when calling unbind', async () => {
    let unbind: ReturnType<typeof rtdbBindAsArray> = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = rtdbBindAsArray(
        { target, collection, resolve, reject, ops },
        // will have no effect when unbinding
        { reset: () => ['Foo'] }
      )
      collection.flush()
    })
    await promise
    collection.push({ foo: 'foo' })
    collection.flush()
    unbind()
    expect(target.value).toEqual([])
  })

  it('can wait until ready', async () => {
    collection.push({ name: 'one' })
    collection.push({ name: 'two' })
    collection.flush()

    const other = new MockFirebase().child('other')

    expect(target.value).toEqual([{ name: 'one' }, { name: 'two' }])

    // force the unbind without resetting the value
    unbind(false)
    const promise = new Promise((resolve, reject) => {
      rtdbBindAsArray(
        {
          target,
          collection: other,
          resolve,
          reject,
          ops,
        },
        { wait: true }
      )
    })

    expect(target.value).toEqual([{ name: 'one' }, { name: 'two' }])
    other.flush()
    await promise
    expect(target.value).toEqual([])

    other.push({ other: 'one' })
    other.push({ other: 'two' })
    other.flush()

    expect(target.value).toEqual([{ other: 'one' }, { other: 'two' }])
  })

  it('can wait until ready with empty arrays', async () => {
    expect(target.value).toEqual([])

    const other = new MockFirebase().child('other')
    other.push({ a: 0 })
    other.push({ b: 1 })
    other.flush()

    unbind(false)
    const promise = new Promise((resolve, reject) => {
      rtdbBindAsArray(
        {
          target,
          collection: other,
          resolve,
          reject,
          ops,
        },
        { wait: true }
      )
    })

    expect(target.value).toEqual([])
    other.flush()
    await promise
    expect(target.value).toEqual([{ a: 0 }, { b: 1 }])
  })

  it('rejects when errors', async () => {
    const error = new Error()
    const collection = new MockFirebase().child('data')
    collection.failNext('once', error)
    const target = ref([])
    await expect(
      new Promise((resolve, reject) => {
        unbind = rtdbBindAsArray({
          target,
          collection,
          resolve,
          reject,
          ops,
        })
        collection.flush()
      })
    ).rejects.toBe(error)
  })
})
