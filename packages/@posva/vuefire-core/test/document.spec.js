import { bindDocument, walkSet } from '../src'
import { db, tick, Vue } from '@posva/vuefire-test-helpers'

describe('documents', () => {
  let collection, document, vm, resolve, reject, ops
  beforeEach(async () => {
    ops = {
      add: jest.fn(),
      set: jest.fn(walkSet),
      remove: jest.fn(),
    }
    collection = db.collection()
    document = collection.doc()
    vm = {}
    await new Promise((res, rej) => {
      resolve = jest.fn(res)
      reject = jest.fn(rej)
      bindDocument({ vm, key: 'item', document, resolve, reject, ops })
    })
  })

  it('does not call anything if document does not exist', () => {
    expect(ops.add).not.toHaveBeenCalled()
    expect(ops.set).not.toHaveBeenCalled()
    expect(ops.remove).not.toHaveBeenCalled()
    expect(resolve).toHaveBeenCalled()
    expect(reject).not.toHaveBeenCalled()
  })

  it('updates a document', async () => {
    await document.update({ foo: 'foo' })
    expect(ops.add).not.toHaveBeenCalled()
    expect(ops.set).toHaveBeenCalledTimes(1)
    expect(ops.set).toHaveBeenLastCalledWith(vm, 'item', { foo: 'foo' })
    expect(ops.remove).not.toHaveBeenCalled()
    await document.update({ bar: 'bar' })
    expect(ops.set).toHaveBeenCalledTimes(2)
    expect(ops.set).toHaveBeenLastCalledWith(vm, 'item', { bar: 'bar', foo: 'foo' })
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
})
