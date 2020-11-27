import { bindCollection } from '../../src'
import { db, createOps, spyUnbind } from '@posva/vuefire-test-helpers'
import firebase from 'firebase/app'
import { OperationsType } from '../../src/shared'

describe('collections', () => {
  let collection: firebase.firestore.CollectionReference,
    vm: Record<string, any>,
    resolve: (data: any) => void,
    reject: (error: any) => void,
    ops: OperationsType,
    unbind: ReturnType<typeof bindCollection>

  beforeEach(async () => {
    // @ts-ignore
    collection = db.collection()
    vm = {}
    ops = createOps()
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      unbind = bindCollection({ vm, key: 'items', collection, resolve, reject, ops })
    })
  })

  it('initialise the array', () => {
    expect(ops.set).toHaveBeenCalledTimes(1)
    expect(ops.set).toHaveBeenCalledWith(vm, 'items', [])
  })

  it('add elements', async () => {
    await collection.add({ text: 'foo' })
    expect(ops.add).toHaveBeenCalledTimes(1)
    expect(ops.add).toHaveBeenLastCalledWith(vm.items, 0, { text: 'foo' })
    await collection.add({ text: 'bar' })
    expect(ops.add).toHaveBeenCalledTimes(2)
    expect(ops.add).toHaveBeenLastCalledWith(vm.items, 1, { text: 'bar' })
  })

  it('deletes items', async () => {
    await collection.add({ text: 'foo' })
    await collection.doc(vm.items[0].id).delete()
    expect(ops.remove).toHaveBeenCalledTimes(1)
    expect(ops.remove).toHaveBeenLastCalledWith(vm.items, 0)
  })

  it('update items', async () => {
    const doc = await collection.add({ text: 'foo', more: true })
    await doc.update({ text: 'bar' })
    expect(ops.set).toHaveBeenCalledTimes(1)
    expect(ops.set).toHaveBeenLastCalledWith(vm, 'items', [{ more: true, text: 'bar' }])
  })

  it('add properties', async () => {
    const doc = await collection.add({ text: 'foo' })
    await doc.update({ other: 'bar' })
    expect(ops.set).toHaveBeenCalledTimes(1)
    expect(ops.set).toHaveBeenLastCalledWith(vm, 'items', [{ other: 'bar', text: 'foo' }])
  })

  it('can bind arrays with null', async () => {
    await collection.add({ array: [2, null] })
    expect(ops.set).toHaveBeenCalledTimes(1)
    expect(ops.set).toHaveBeenLastCalledWith(vm, 'items', [{ array: [2, null] }])
  })

  // TODO move to vuefire
  it.skip('unbinds when the instance is destroyed', async () => {
    expect(vm._firestoreUnbinds).toBeTruthy()
    expect(vm.items).toEqual([])
    const spy = jest.spyOn(vm._firestoreUnbinds, 'items')
    expect(() => {
      vm.$destroy()
    }).not.toThrow()
    expect(spy).toHaveBeenCalled()
    expect(vm._firestoreUnbinds).toBe(null)
    await expect(async () => {
      await collection.add({ text: 'foo' })
      expect(vm.items).toEqual([])
    }).not.toThrow()
  })

  it('adds non-enumerable id', async () => {
    const a = await collection.doc('u0')
    const b = await collection.doc('u1')
    await a.update({})
    await b.update({})
    expect(vm.items.length).toBe(2)
    vm.items.forEach((item: Record<string, any>, i: number) => {
      expect(Object.getOwnPropertyDescriptor(item, 'id')).toEqual({
        configurable: false,
        enumerable: false,
        writable: false,
        value: `u${i}`,
      })
    })
  })

  it('manually unbinds a collection', async () => {
    // @ts-ignore
    collection = db.collection()
    await collection.add({ text: 'foo' })
    const unbindSpy = spyUnbind(collection)
    let unbind: () => void = () => {
      throw new Error('Promise was not called')
    }
    await new Promise((resolve, reject) => {
      unbind = bindCollection({
        vm,
        collection,
        key: 'items',
        resolve,
        reject,
        ops,
      })
    })

    expect(unbindSpy).not.toHaveBeenCalled()
    expect(vm.items).toEqual([{ text: 'foo' }])
    unbind()
    expect(unbindSpy).toHaveBeenCalled()

    // reset data manually
    const expected = vm.items
    await collection.add({ text: 'bar' })
    // still old version
    expect(vm.items).toEqual(expected)
    unbindSpy.mockRestore()
  })

  it('rejects when errors', async () => {
    const fakeOnSnapshot = (_: any, fail: (error: Error) => void) => {
      fail(new Error('nope'))
    }
    // @ts-ignore
    collection = db.collection()
    // @ts-ignore
    collection.onSnapshot = jest.fn(fakeOnSnapshot)
    await expect(
      new Promise((resolve, reject) => {
        bindCollection({ vm, collection, key: 'items', resolve, reject, ops })
      })
    ).rejects.toThrow()
    // @ts-ignore
    collection.onSnapshot.mockRestore()
  })

  it('resolves when the collection is populated', async () => {
    await collection.add({ foo: 'foo' })
    await collection.add({ foo: 'foo' })
    const promise = new Promise((resolve, reject) => {
      bindCollection({ vm, collection, key: 'items', resolve, reject, ops })
    })
    await promise
    expect(vm.items).toEqual([{ foo: 'foo' }, { foo: 'foo' }])
  })

  it('resets the value when unbinding', async () => {
    await collection.add({ foo: 'foo' })
    let unbind: () => void = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = bindCollection({
        vm,
        collection,
        key: 'items',
        resolve,
        reject,
        ops,
      })
    })
    await promise
    expect(vm.items).toEqual([{ foo: 'foo' }])
    unbind()
    expect(vm.items).toEqual([])
  })

  it('can be left as is with reset: false', async () => {
    await collection.add({ foo: 'foo' })
    let unbind: ReturnType<typeof bindCollection> = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = bindCollection({
        vm,
        collection,
        key: 'items',
        resolve,
        reject,
        ops,
      })
    })
    await promise
    expect(vm.items).toEqual([{ foo: 'foo' }])
    unbind(false)
    expect(vm.items).toEqual([{ foo: 'foo' }])
  })

  it('can be reset to a specific value', async () => {
    await collection.add({ foo: 'foo' })
    let unbind: ReturnType<typeof bindCollection> = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = bindCollection({
        vm,
        collection,
        key: 'items',
        resolve,
        reject,
        ops,
      })
    })
    await promise
    expect(vm.items).toEqual([{ foo: 'foo' }])
    unbind(() => [{ bar: 'bar' }, { baz: 'baz' }])
    expect(vm.items).toEqual([{ bar: 'bar' }, { baz: 'baz' }])
  })

  it('ignores reset option in bind when calling unbind', async () => {
    // @ts-ignore
    const other: firestore.CollectionReference = db.collection()
    await other.add({ a: 0 })
    await other.add({ b: 1 })

    await new Promise((resolve, reject) => {
      unbind = bindCollection(
        { vm, collection: other, key: 'items', resolve, reject, ops },
        { reset: false }
      )
    })
    expect(vm.items).toEqual([{ a: 0 }, { b: 1 }])
    unbind()
    expect(vm.items).toEqual([])
  })

  it('can wait until ready', async () => {
    await collection.add({ foo: 'foo' })
    await collection.add({ foo: 'foo' })
    expect(vm.items).toEqual([{ foo: 'foo' }, { foo: 'foo' }])

    // @ts-ignore
    const other: firestore.CollectionReference = db.collection()

    // force the unbind without resetting the value
    unbind(false)
    const promise = new Promise((resolve, reject) => {
      bindCollection({ vm, collection: other, key: 'items', resolve, reject, ops }, { wait: true })
    })
    expect(vm.items).toEqual([{ foo: 'foo' }, { foo: 'foo' }])
    await promise
    expect(vm.items).toEqual([])
    // we can add other stuff
    await other.add({ a: 0 })
    await other.add({ b: 1 })
    expect(vm.items).toEqual([{ a: 0 }, { b: 1 }])
  })

  it('sets the value to an empty array even with no documents', async () => {
    vm.items = 'foo'
    await new Promise((resolve, reject) => {
      bindCollection(
        {
          vm,
          // @ts-ignore
          collection: db.collection(),
          key: 'items',
          resolve,
          reject,
          ops,
        },
        { wait: true }
      )
    })
    expect(vm.items).toEqual([])
  })

  it('can wait until ready with empty arrays', async () => {
    expect(vm.items).toEqual([])
    expect(resolve).toHaveBeenCalledWith([])

    // @ts-ignore
    const other: firestore.CollectionReference = db.collection()
    await other.add({ a: 0 })
    await other.add({ b: 1 })

    // force the unbind without resetting the value
    unbind(false)
    const promise = new Promise((resolve, reject) => {
      bindCollection({ vm, collection: other, key: 'items', resolve, reject, ops }, { wait: true })
    })
    expect(vm.items).toEqual([])
    await promise
    expect(vm.items).toEqual([{ a: 0 }, { b: 1 }])
  })
})
