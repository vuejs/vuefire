import { bindDocument, FirestoreOptions } from '../../src'
import {
  db,
  delay,
  spyUnbind,
  spyOnSnapshot,
  spyOnSnapshotCallback,
  createOps,
} from '@posva/vuefire-test-helpers'
import { firestore } from 'firebase'
import { OperationsType } from '../../src/shared'

describe('refs in documents', () => {
  // a and c existing objects { isA: true }
  // item is an empty ready to use object
  // empty is an empty object that is left empty
  // d has a ref to c
  let collection: firestore.CollectionReference,
    a: firestore.DocumentReference,
    b: firestore.DocumentReference,
    c: firestore.DocumentReference,
    d: firestore.DocumentReference,
    empty: firestore.DocumentReference,
    item: firestore.DocumentReference,
    vm: Record<string, any>,
    bind: (key: string, document: firestore.DocumentReference, options?: FirestoreOptions) => void,
    unbind: () => void,
    ops: OperationsType

  beforeEach(async () => {
    vm = {
      item: null,
      a: null,
      b: null,
      c: null,
    }
    ops = createOps()
    // @ts-ignore
    collection = db.collection()
    // @ts-ignore
    a = db.collection().doc()
    // @ts-ignore
    b = db.collection().doc()
    // @ts-ignore
    empty = db.collection().doc()
    // @ts-ignore
    item = db.collection().doc()
    c = collection.doc()
    d = collection.doc()
    await a.update({ isA: true })
    await c.update({ isC: true })
    await d.update({ ref: c })
    bind = (key, document, options) => {
      return new Promise(
        (resolve, reject) =>
          (unbind = bindDocument({ vm, key, document, resolve, reject, ops }, options))
      )
    }

    await Promise.all([bind('c', c), bind('d', d)])

    // wait for refs to be ready as well
    await delay(5)
    // @ts-ignore
    ops.set.mockClear()
    // @ts-ignore
    ops.add.mockClear()
    // @ts-ignore
    ops.remove.mockClear()
  })

  it('item should be removed from binding when theres an arrays of refs', async () => {
    const arr = collection.doc()
    vm.arr = null

    await arr.update({ refs: [a, b, c] })
    await bind('arr', arr, { maxRefDepth: 0 })
    await arr.update({ refs: [b, c] })

    expect(vm.arr).toEqual({ refs: [b.path, c.path] })
  })

  it('binds refs on documents', async () => {
    // create an empty doc and update using the ref instead of plain data
    await item.update({ ref: c })
    await bind('item', item)

    expect(ops.set).toHaveBeenCalledTimes(2)
    expect(ops.set).toHaveBeenNthCalledWith(1, vm, 'item', vm.item)
    expect(ops.set).toHaveBeenNthCalledWith(2, vm, 'item.ref', vm.item.ref)

    expect(vm.item).toEqual({
      ref: { isC: true },
    })
  })

  it('binds refs nested in documents (objects)', async () => {
    await item.update({
      obj: {
        ref: c,
      },
    })
    await bind('item', item)

    expect(ops.set).toHaveBeenCalledTimes(2)
    expect(ops.set).toHaveBeenNthCalledWith(1, vm, 'item', vm.item)
    expect(ops.set).toHaveBeenNthCalledWith(2, vm, 'item.obj.ref', vm.item.obj.ref)

    expect(vm.item).toEqual({
      obj: {
        ref: { isC: true },
      },
    })
  })

  it('binds refs deeply nested in documents (objects)', async () => {
    await item.update({
      obj: {
        nested: {
          ref: c,
        },
      },
    })
    await bind('item', item)

    expect(ops.set).toHaveBeenCalledTimes(2)
    expect(ops.set).toHaveBeenNthCalledWith(1, vm, 'item', vm.item)
    expect(ops.set).toHaveBeenNthCalledWith(2, vm, 'item.obj.nested.ref', vm.item.obj.nested.ref)

    expect(vm.item).toEqual({
      obj: {
        nested: {
          ref: {
            isC: true,
          },
        },
      },
    })
  })

  it('update inner ref', async () => {
    expect(vm.d).toEqual({
      ref: {
        isC: true,
      },
    })

    await c.update({ isC: false })

    expect(ops.set).toHaveBeenCalledTimes(2)
    // the first call is pretty much irrelevant but included in case
    // one day it breaks and I need to know why
    expect(ops.set).toHaveBeenNthCalledWith(1, vm, 'c', vm.c)
    expect(ops.set).toHaveBeenNthCalledWith(2, vm, 'd.ref', vm.d.ref)

    expect(vm.d).toEqual({
      ref: {
        isC: false,
      },
    })
  })

  it('is null if ref does not exist', async () => {
    await d.update({ ref: empty })

    // NOTE(1) need to wait because we updated with a ref
    await delay(5)

    expect(ops.set).toHaveBeenNthCalledWith(2, vm, 'd.ref', null)

    expect(vm.d).toEqual({
      ref: null,
    })
  })

  it('unbinds previously bound document when overwriting a bound', async () => {
    // Mock c onSnapshot to spy when the callback is called
    const spy = spyOnSnapshotCallback(item)
    await item.update({ baz: 'baz' })
    await d.update({ ref: item })
    // NOTE see #1
    await delay(5)
    expect(spy).toHaveBeenCalledTimes(1)
    await item.update({ baz: 'bar' })
    // make sure things are updating correctly
    expect(vm.d).toEqual({
      ref: { baz: 'bar' },
    })
    // we call update twice to make sure our mock works
    expect(spy).toHaveBeenCalledTimes(2)
    await d.update({ ref: b })
    // NOTE see #1
    await delay(5)

    expect(vm.d).toEqual({
      ref: null,
    })
    await item.update({ foo: 'bar' })

    expect(spy).toHaveBeenCalledTimes(2)
    expect(vm.d).toEqual({
      ref: null,
    })
    spy.mockRestore()
  })

  it('does not rebind if it is the same ref', async () => {
    const spy = spyOnSnapshot(item)
    await item.update({ baz: 'baz' })
    await d.update({ ref: item })
    // NOTE see #1
    await delay(5)
    expect(spy).toHaveBeenCalledTimes(1)

    await d.update({ ref: item })
    await delay(5)

    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('resolves the promise when refs are resolved in a document', async () => {
    await item.update({ ref: a })

    await bind('item', item)
    expect(vm.item).toEqual({ ref: { isA: true } })
  })

  it('resolves the promise when nested refs are resolved in a document', async () => {
    await item.update({ ref: a })
    await d.update({ ref: item })

    await bind('item', d)
    expect(vm.item).toEqual({ ref: { ref: { isA: true } } })
  })

  it('resolves the promise when nested non-existant refs are resolved in a document', async () => {
    await item.update({ ref: empty })
    await d.update({ ref: item })

    await bind('item', d)
    expect(vm.item).toEqual({ ref: { ref: null } })
  })

  it('resolves the promise when the document does not exist', async () => {
    expect(vm.item).toEqual(null)
    await bind('item', empty)
    expect(vm.item).toBe(null)
  })

  it('unbinds all refs when the document is unbound', async () => {
    const cSpy = spyUnbind(c)
    const dSpy = spyUnbind(d)
    // rebind to use the spies
    await bind('d', d)
    expect(vm.d).toEqual({
      ref: {
        isC: true,
      },
    })
    unbind()

    expect(dSpy).toHaveBeenCalledTimes(1)
    expect(cSpy).toHaveBeenCalledTimes(1)

    cSpy.mockRestore()
    dSpy.mockRestore()
  })

  it('unbinds nested refs when the document is unbound', async () => {
    const aSpy = spyUnbind(a)
    const cSpy = spyUnbind(b)
    const dSpy = spyUnbind(item)

    await b.update({ ref: a })
    await item.update({ ref: b })

    await bind('item', item)
    unbind()

    expect(dSpy).toHaveBeenCalledTimes(1)
    expect(cSpy).toHaveBeenCalledTimes(1)
    expect(aSpy).toHaveBeenCalledTimes(1)

    aSpy.mockRestore()
    cSpy.mockRestore()
    dSpy.mockRestore()
  })

  it('unbinds multiple refs when the document is unbound', async () => {
    const aSpy = spyUnbind(a)
    const cSpy = spyUnbind(c)
    const dSpy = spyUnbind(item)

    await item.update({ c, a })

    await bind('item', item)
    unbind()

    expect(dSpy).toHaveBeenCalledTimes(1)
    expect(cSpy).toHaveBeenCalledTimes(1)
    expect(aSpy).toHaveBeenCalledTimes(1)

    aSpy.mockRestore()
    cSpy.mockRestore()
    dSpy.mockRestore()
  })

  it('unbinds when a ref is replaced', async () => {
    const aSpy = spyUnbind(a)
    const cSpy = spyUnbind(c)
    const dSpy = spyUnbind(d)

    await bind('d', d)
    expect(vm.d).toEqual({
      ref: {
        isC: true,
      },
    })

    await d.update({ ref: a })
    // NOTE see #1
    await delay(5)
    expect(vm.d).toEqual({
      ref: {
        isA: true,
      },
    })

    // expect(dSpy.mock.calls.length).toBe(1)
    expect(cSpy).toHaveBeenCalledTimes(1)
    expect(aSpy).toHaveBeenCalledTimes(0)

    aSpy.mockRestore()
    cSpy.mockRestore()
    dSpy.mockRestore()
  })

  it('unbinds removed properties', async () => {
    // @ts-ignore
    const a: firestore.DocumentReference = db.collection().doc()
    const unbindSpy = spyUnbind(a)
    const callbackSpy = spyOnSnapshotCallback(a)
    const onSnapshotSpy = spyOnSnapshot(a)

    // @ts-ignore
    const item: firestore.DocumentReference = db.collection().doc()
    await a.update({ isA: true })
    await b.update({ isB: true })
    await item.update({ a })

    expect(unbindSpy).toHaveBeenCalledTimes(0)
    expect(callbackSpy).toHaveBeenCalledTimes(0)
    expect(onSnapshotSpy).toHaveBeenCalledTimes(0)
    await bind('item', item)

    expect(unbindSpy).toHaveBeenCalledTimes(0)
    expect(callbackSpy).toHaveBeenCalledTimes(1)
    expect(onSnapshotSpy).toHaveBeenCalledTimes(1)

    await item.set({ b })
    await a.update({ newA: true })
    // NOTE see #1
    await delay(5)

    expect(unbindSpy).toHaveBeenCalledTimes(1)
    expect(callbackSpy).toHaveBeenCalledTimes(1)
    expect(onSnapshotSpy).toHaveBeenCalledTimes(1)

    unbindSpy.mockRestore()
    callbackSpy.mockRestore()
    onSnapshotSpy.mockRestore()
  })

  it('binds refs on arrays', async () => {
    // @ts-ignore
    const item: firestore.DocumentReference = db.collection().doc()
    await b.update({ isB: true })

    await item.update({
      arr: [a, b, a],
    })

    await bind('item', item)

    expect(vm.item).toEqual({
      arr: [{ isA: true }, { isB: true }, { isA: true }],
    })
  })

  it('properly updates a documen with refs', async () => {
    await item.update({ a })
    await bind('item', item)

    expect(vm.item).toEqual({
      a: { isA: true },
    })

    await item.update({ newThing: true })

    // NOTE see (1)
    await delay(5)

    expect(vm.item).toEqual({
      newThing: true,
      a: { isA: true },
    })
  })

  it('updates values in arrays', async () => {
    await item.update({
      arr: [a, b],
    })

    await bind('item', item)

    expect(vm.item).toEqual({
      arr: [{ isA: true }, null],
    })

    await b.update({ isB: true })

    expect(vm.item).toEqual({
      arr: [{ isA: true }, { isB: true }],
    })

    await item.update({
      arr: [c],
    })

    // NOTE see (1)
    await delay(5)

    expect(vm.item).toEqual({
      arr: [{ isC: true }],
    })
  })

  // TODO move to vuefire
  it.skip('correctly updates arrays', async () => {
    await item.update({
      arr: [a, b],
    })

    await bind('item', item)

    const spy = jest.fn()
    vm.$watch('item.arr', spy)

    await b.update({ isB: true })

    expect(spy).toHaveBeenCalledTimes(1)

    await item.update({
      arr: [c],
    })

    expect(spy).toHaveBeenCalledTimes(2)

    // NOTE see (1)
    await delay(5)

    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('respects provided maxRefDepth', async () => {
    await item.update({ a })
    await a.set({ b })
    await b.set({ c })
    await d.set({ isD: true })
    await c.set({ d })

    await bind('item', item, { maxRefDepth: 1 })
    expect(vm.item).toEqual({
      a: {
        b: b.path,
      },
    })

    await bind('item', item, { maxRefDepth: 3 })
    expect(vm.item).toEqual({
      a: {
        b: {
          c: {
            d: d.path,
          },
        },
      },
    })
  })

  it('does not fail with cyclic refs', async () => {
    await item.set({ item })
    await bind('item', item, { maxRefDepth: 5 })

    expect(vm.item).toEqual({
      // it's easy to see we stop at 5 and we have 5 brackets
      item: {
        item: {
          item: {
            item: {
              item: {
                item: item.path,
              },
            },
          },
        },
      },
    })
  })
})
