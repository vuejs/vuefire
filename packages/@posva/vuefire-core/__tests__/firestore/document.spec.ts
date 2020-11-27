import { bindDocument } from '../../src'
import { db, spyUnbind, createOps } from '@posva/vuefire-test-helpers'
import firebase from 'firebase/app'
import { OperationsType } from '../../src/shared'

describe('documents', () => {
  let collection: firebase.firestore.CollectionReference,
    document: firebase.firestore.DocumentReference,
    vm: Record<string, any>,
    resolve: (data: any) => void,
    reject: (error: any) => void,
    ops: OperationsType

  beforeEach(async () => {
    // @ts-ignore
    collection = db.collection()
    // @ts-ignore
    document = collection.doc()
    ops = createOps()
    vm = {}
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      bindDocument({ vm, key: 'item', document, resolve, reject, ops })
    })
  })

  it('does not call anything if document does not exist', () => {
    expect(ops.add).not.toHaveBeenCalled()
    expect(ops.set).toHaveBeenCalled()
    expect(ops.set).toHaveBeenCalledWith(vm, 'item', null)
    expect(ops.remove).not.toHaveBeenCalled()
    expect(reject).not.toHaveBeenCalled()
  })

  it('binding to a non-existant document sets the property to null', async () => {
    vm.item = 'foo'
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      bindDocument({ vm, key: 'item', document: collection.doc(), resolve, reject, ops })
    })
    expect(vm.item).toBe(null)
    expect(resolve).toHaveBeenCalledWith(null)
  })

  it('updates a document', async () => {
    await document.update({ foo: 'foo' })
    expect(ops.add).not.toHaveBeenCalled()
    expect(ops.set).toHaveBeenCalledTimes(2)
    expect(ops.set).toHaveBeenLastCalledWith(vm, 'item', { foo: 'foo' })
    expect(ops.remove).not.toHaveBeenCalled()
    await document.update({ bar: 'bar' })
    expect(ops.set).toHaveBeenCalledTimes(3)
    expect(ops.set).toHaveBeenLastCalledWith(vm, 'item', {
      bar: 'bar',
      foo: 'foo',
    })
  })

  it('sets to null when deleted', async () => {
    await document.update({ foo: 'foo' })
    await document.delete()
    expect(vm.item).toBe(null)
  })

  it('adds non-enumerable id', async () => {
    document = collection.doc('some-id')
    bindDocument({ vm, document, key: 'item', resolve, reject, ops })
    await document.update({ foo: 'foo' })
    expect(Object.getOwnPropertyDescriptor(vm.item, 'id')).toEqual({
      configurable: false,
      enumerable: false,
      writable: false,
      value: 'some-id',
    })
  })

  it('manually unbinds a document', async () => {
    document = collection.doc()
    await document.update({ foo: 'foo' })
    const unbindSpy = spyUnbind(document)
    let unbind: () => void = () => {
      throw new Error('Promise was not called')
    }
    await new Promise((resolve, reject) => {
      unbind = bindDocument({ vm, document, key: 'item', resolve, reject, ops })
    })

    expect(unbindSpy).not.toHaveBeenCalled()
    expect(vm.item).toEqual({ foo: 'foo' })
    unbind()
    expect(unbindSpy).toHaveBeenCalled()

    // reset data manually
    vm.item = null
    await document.update({ foo: 'foo' })
    expect(vm.item).toEqual(null)
    unbindSpy.mockRestore()
  })

  it('rejects when errors', async () => {
    const fakeOnSnapshot = (_: any, fail: (err: Error) => void) => {
      fail(new Error('nope'))
    }
    document = collection.doc()
    // @ts-ignore
    document.onSnapshot = jest.fn(fakeOnSnapshot)
    await expect(
      new Promise((resolve, reject) => {
        bindDocument({ vm, document, key: 'item', resolve, reject, ops })
      })
    ).rejects.toThrow()
    // @ts-ignore
    document.onSnapshot.mockRestore()
  })

  it('resolves when the document is set', async () => {
    await document.update({ foo: 'foo' })
    const promise = new Promise((resolve, reject) => {
      bindDocument({ vm, document, key: 'item', resolve, reject, ops })
    })
    await promise
    expect(vm.item).toEqual({ foo: 'foo' })
  })

  it('resets the value when unbinding', async () => {
    await document.update({ foo: 'foo' })
    let unbind: ReturnType<typeof bindDocument> = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = bindDocument({ vm, document, key: 'item', resolve, reject, ops })
    })
    await promise
    expect(vm.item).toEqual({ foo: 'foo' })
    unbind()
    expect(vm.item).toEqual(null)
  })

  it('can be left as is with reset: false', async () => {
    await document.update({ foo: 'foo' })
    let unbind: ReturnType<typeof bindDocument> = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = bindDocument({ vm, document, key: 'item', resolve, reject, ops })
    })
    await promise
    expect(vm.item).toEqual({ foo: 'foo' })
    unbind(false)
    expect(vm.item).toEqual({ foo: 'foo' })
  })

  it('can be reset to a specific value', async () => {
    await document.update({ foo: 'foo' })
    let unbind: ReturnType<typeof bindDocument> = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = bindDocument({ vm, document, key: 'item', resolve, reject, ops })
    })
    await promise
    expect(vm.item).toEqual({ foo: 'foo' })
    unbind(() => ({ bar: 'bar' }))
    expect(vm.item).toEqual({ bar: 'bar' })
  })

  it('ignores reset option in bind when calling unbind', async () => {
    await document.update({ foo: 'foo' })
    let unbind: ReturnType<typeof bindDocument> = () => {
      throw new Error('Promise was not called')
    }
    const promise = new Promise((resolve, reject) => {
      unbind = bindDocument({ vm, document, key: 'item', resolve, reject, ops }, { reset: false })
    })
    await promise
    expect(vm.item).toEqual({ foo: 'foo' })
    unbind()
    expect(vm.item).toEqual(null)
  })
})
