import { bindCollection, walkSet, FirestoreOptions } from '../../src'
import { db, delay, spyUnbind, delayUpdate, createOps } from '@posva/vuefire-test-helpers'
import { OperationsType } from '../../src/shared'
import { firestore } from 'firebase'

describe('refs in collections', () => {
  let collection: firestore.CollectionReference,
    a: firestore.DocumentReference,
    b: firestore.DocumentReference,
    vm: Record<string, any>,
    bind: (
      key: string,
      collection: firestore.CollectionReference,
      options?: FirestoreOptions
    ) => void,
    unbind: () => void,
    ops: OperationsType,
    first: Record<string, any>

  beforeEach(async () => {
    vm = {
      items: null,
      a: null,
      b: null,
      c: null
    }
    ops = createOps(walkSet)
    bind = (key, collection, options) => {
      return new Promise(
        (resolve, reject) =>
          (unbind = bindCollection({ vm, key, collection, resolve, reject, ops }, options))
      )
    }
    // @ts-ignore
    a = db.collection().doc()
    // @ts-ignore
    b = db.collection().doc()
    await a.update({ isA: true })
    await b.update({ isB: true })
    // @ts-ignore
    collection = db.collection()
    first = await collection.add({ ref: a })
    await collection.add({ ref: b })
  })

  it('binds refs on collections', async () => {
    await bind('items', collection)

    expect(vm.items).toEqual([{ ref: { isA: true }}, { ref: { isB: true }}])
  })

  it('waits for array to be fully populated', async () => {
    const c = db.collection().doc()
    await c.update({ isC: true })
    await collection.add({ ref: c })
    // force callback delay

    // @ts-ignore
    delayUpdate(c)
    const data = await bind('items', collection)

    expect(data).toEqual(vm.items)
    expect(vm.items).toEqual([
      { ref: { isA: true }},
      { ref: { isB: true }},
      { ref: { isC: true }}
    ])
  })

  it('binds refs when adding to collection', async () => {
    await bind('items', collection)
    const c = db.collection().doc()
    await c.update({ isC: true })

    await collection.add({ ref: c })
    // NOTE wait for refs to update
    await delay(5)

    expect(vm.items).toEqual([
      { ref: { isA: true }},
      { ref: { isB: true }},
      { ref: { isC: true }}
    ])
  })

  it('unbinds refs when the collection is unbound', async () => {
    const items = db.collection()
    const spyA = spyUnbind(a)
    const spyB = spyUnbind(b)
    await items.add({ ref: a })
    await items.add({ ref: b })
    // @ts-ignore
    await bind('items', items)

    expect(spyA).toHaveBeenCalledTimes(0)
    expect(spyB).toHaveBeenCalledTimes(0)

    unbind()

    expect(spyA).toHaveBeenCalledTimes(1)
    expect(spyB).toHaveBeenCalledTimes(1)

    spyA.mockRestore()
    spyB.mockRestore()
  })

  it('unbinds nested refs when the collection is unbound', async () => {
    const items = db.collection()
    const spyA = spyUnbind(a)
    await items.add({ ref: { ref: a }})
    // @ts-ignore
    await bind('items', items)

    expect(spyA).toHaveBeenCalledTimes(0)

    unbind()
    expect(spyA).toHaveBeenCalledTimes(1)

    spyA.mockRestore()
  })

  it('unbinds refs when items are removed', async () => {
    const spyA = spyUnbind(a)
    await bind('items', collection)
    expect(spyA).toHaveBeenCalledTimes(0)

    await collection.doc(vm.items[0].id).delete()
    expect(spyA).toHaveBeenCalledTimes(1)

    spyA.mockRestore()
  })

  it('unbinds refs when items are modified', async () => {
    const spyA = spyUnbind(a)
    await bind('items', collection)
    expect(spyA).toHaveBeenCalledTimes(0)

    await first.set({ b })

    expect(spyA).toHaveBeenCalledTimes(1)

    spyA.mockRestore()
  })

  it('updates when modifying an item', async () => {
    await bind('items', collection)

    await first.update({ newThing: true })
    await delay(5)

    expect(vm.items).toEqual([{ ref: { isA: true }, newThing: true }, { ref: { isB: true }}])
  })

  it('keeps old data of refs when modifying an item', async () => {
    await bind('items', collection)
    await first.update({ newThing: true })

    expect(vm.items[0]).toEqual({
      ref: { isA: true },
      newThing: true
    })
  })

  it('respects provided maxRefDepth', async () => {
    const a = db.collection().doc()
    const b = db.collection().doc()
    const c = db.collection().doc()
    const d = db.collection().doc()
    await a.set({ b })
    await b.set({ c })
    await d.set({ isD: true })
    await c.set({ d })
    const collection = db.collection()
    await collection.add({ a })

    // @ts-ignore
    await bind('items', collection, { maxRefDepth: 1 })
    expect(vm.items).toEqual([
      {
        a: {
          b: b.path
        }
      }
    ])

    // @ts-ignore
    await bind('items', collection, { maxRefDepth: 3 })
    expect(vm.items).toEqual([
      {
        a: {
          b: {
            c: {
              d: d.path
            }
          }
        }
      }
    ])
  })

  it('does not fail with cyclic refs', async () => {
    const item = db.collection().doc()
    await item.set({ item })
    const collection = db.collection()
    await collection.add({ item })
    // @ts-ignore
    await bind('items', collection, { maxRefDepth: 5 })

    expect(vm.items).toEqual([
      {
        // it's easy to see we stop at 5 and we have 5 brackets
        item: {
          item: {
            item: {
              item: {
                item: {
                  item: item.path
                }
              }
            }
          }
        }
      }
    ])
  })
})
