import { ref, Ref } from 'vue'
import {
  rtdbBindAsObject,
  rtdbBindAsArray,
  rtdbOptions,
} from '../../../src/core'
import { MockFirebase, createOps, MockedReference } from '../../src'

describe('RTDB options', () => {
  let collection: MockedReference,
    document: MockedReference,
    target: Ref<Record<string, any>>,
    unbind: () => void
  const ops = createOps()
  beforeEach(async () => {
    collection = new MockFirebase().child('data')
    document = new MockFirebase().child('data')
    target = ref({})
  })

  afterEach(() => {
    unbind && unbind()
  })

  it('allows customizing serialize when calling bindDocument', async () => {
    const spy = jest.fn(() => ({ bar: 'foo' }))
    await new Promise((resolve, reject) => {
      unbind = rtdbBindAsObject(
        {
          target,
          document,
          resolve,
          reject,
          ops,
        },
        { serialize: spy }
      )
      document.set({ foo: 'foo' })
      document.flush()
    })

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith(
      // @ts-ignore WTF TS?????
      expect.objectContaining({ val: expect.any(Function) })
    )
    expect(target.value).toEqual({ bar: 'foo' })
  })

  it('allows customizing serialize when calling bindCollection', async () => {
    const spy = jest.fn(() => ({ bar: 'foo' }))

    await new Promise((resolve, reject) => {
      unbind = rtdbBindAsArray(
        {
          target,
          collection,
          resolve,
          reject,
          ops,
        },
        { serialize: spy }
      )
      collection.push({ foo: 'foo' })
      collection.flush()
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(
      // @ts-ignore WTF TS?????
      expect.objectContaining({ val: expect.any(Function) })
    )
    expect(target.value).toEqual([{ bar: 'foo' }])
  })

  it('can set options globally for bindDocument', async () => {
    const { serialize } = rtdbOptions
    const spy = jest.fn(() => ({ bar: 'foo' }))
    rtdbOptions.serialize = spy

    await new Promise((resolve, reject) => {
      unbind = rtdbBindAsObject(
        {
          target,
          document,
          resolve,
          reject,
          ops,
        },
        { serialize: spy }
      )
      document.set({ foo: 'foo' })
      document.flush()
    })

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toBeCalledWith(
      // @ts-ignore WTF TS?????
      expect.objectContaining({ val: expect.any(Function) })
    )
    expect(target.value).toEqual({ bar: 'foo' })
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
          target,
          collection,
          resolve,
          reject,
          ops,
        },
        { serialize: spy }
      )
      collection.push({ foo: 'foo' })
      collection.flush()
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith(
      // @ts-ignore WTF TS?????
      expect.objectContaining({ val: expect.any(Function) })
    )
    expect(target.value).toEqual([{ bar: 'foo' }])
    // restore it
    rtdbOptions.serialize = serialize
  })
})
