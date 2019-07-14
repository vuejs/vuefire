import { walkSet, rtdbBindAsObject, rtdbBindAsArray, rtdbOptions } from '../../src'
import { MockFirebase, createOps, MockedReference } from '@posva/vuefire-test-helpers'

describe('RTDB options', () => {
  let collection: MockedReference,
    document: MockedReference,
    vm: Record<string, any>,
    unbind: () => void
  const ops = createOps(walkSet)
  beforeEach(async () => {
    collection = new MockFirebase().child('data')
    document = new MockFirebase().child('data')
    vm = {}
  })

  afterEach(() => {
    unbind && unbind()
  })

  it('allows customizing serialize when calling bindDocument', async () => {
    const spy = jest.fn(() => ({ bar: 'foo' }))
    await new Promise((resolve, reject) => {
      unbind = rtdbBindAsObject(
        {
          vm,
          key: 'item',
          document,
          resolve,
          reject,
          ops
        },
        { serialize: spy }
      )
      document.set({ foo: 'foo' })
      document.flush()
    })

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ val: expect.any(Function) }))
    expect(vm.item).toEqual({ bar: 'foo' })
  })

  it('allows customizing serialize when calling bindCollection', async () => {
    const spy = jest.fn(() => ({ bar: 'foo' }))

    await new Promise((resolve, reject) => {
      unbind = rtdbBindAsArray(
        {
          vm,
          key: 'items',
          collection,
          resolve,
          reject,
          ops
        },
        { serialize: spy }
      )
      collection.push({ foo: 'foo' })
      collection.flush()
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(expect.objectContaining({ val: expect.any(Function) }))
    expect(vm.items).toEqual([{ bar: 'foo' }])
  })

  it('can set options globally for bindDocument', async () => {
    const { serialize } = rtdbOptions
    const spy = jest.fn(() => ({ bar: 'foo' }))
    rtdbOptions.serialize = spy

    await new Promise((resolve, reject) => {
      unbind = rtdbBindAsObject(
        {
          vm,
          key: 'item',
          document,
          resolve,
          reject,
          ops
        },
        { serialize: spy }
      )
      document.set({ foo: 'foo' })
      document.flush()
    })

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toBeCalledWith(expect.objectContaining({ val: expect.any(Function) }))
    expect(vm.item).toEqual({ bar: 'foo' })
    // restore it
    rtdbOptions.serialize = serialize
  })

  it('can set options globally for bindCollection', async () => {
    const { serialize } = rtdbOptions
    const spy = jest.fn(() => ({ bar: 'foo' }))
    rtdbOptions.serialize = spy

    await new Promise((resolve, reject) => {
      unbind = rtdbBindAsArray(
        {
          vm,
          key: 'items',
          collection,
          resolve,
          reject,
          ops
        },
        { serialize: spy }
      )
      collection.push({ foo: 'foo' })
      collection.flush()
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(expect.objectContaining({ val: expect.any(Function) }))
    expect(vm.items).toEqual([{ bar: 'foo' }])
    // restore it
    rtdbOptions.serialize = serialize
  })
})
