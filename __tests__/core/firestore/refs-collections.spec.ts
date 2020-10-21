import { bindCollection, FirestoreOptions } from '../../../src/core'
import { db, delay, spyUnbind, delayUpdate, createOps } from '../../src'
import { OperationsType } from '../../../src/shared'
import { firestore } from 'firebase'
import { ref } from 'vue'

const buildRefs = () => ({
  items: ref(),
  a: ref(),
  b: ref(),
  c: ref(),
})

describe('refs in collections', () => {
  let collection: firestore.CollectionReference,
    a: firestore.DocumentReference,
    b: firestore.DocumentReference,
    target: ReturnType<typeof buildRefs>,
    bind: (
      key: keyof ReturnType<typeof buildRefs>,
      collection: firestore.CollectionReference,
      options?: FirestoreOptions
    ) => void,
    unbind: () => void,
    ops: OperationsType,
    first: Record<string, any>

  beforeEach(async () => {
    target = buildRefs()
    ops = createOps()
    bind = (key, collection, options) => {
      return new Promise(
        (resolve, reject) =>
          (unbind = bindCollection(
            target[key],
            collection,
            ops,
            resolve,
            reject,
            options
          ))
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

    expect(target.items.value).toEqual([
      { ref: { isA: true } },
      { ref: { isB: true } },
    ])
  })

  it('waits for array to be fully populated', async () => {
    const c = db.collection().doc()
    await c.update({ isC: true })
    await collection.add({ ref: c })
    // force callback delay

    // @ts-ignore
    delayUpdate(c)
    const data = await bind('items', collection)

    expect(data).toEqual(target.items.value)
    expect(target.items.value).toEqual([
      { ref: { isA: true } },
      { ref: { isB: true } },
      { ref: { isC: true } },
    ])
  })

  it('binds refs when adding to collection', async () => {
    await bind('items', collection)
    const c = db.collection().doc()
    await c.update({ isC: true })

    await collection.add({ ref: c })
    // wait for refs to update
    await delay(5)

    expect(target.items.value).toEqual([
      { ref: { isA: true } },
      { ref: { isB: true } },
      { ref: { isC: true } },
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
    await items.add({ ref: { ref: a } })
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

    await collection.doc(target.items.value[0].id).delete()
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

    expect(target.items.value).toEqual([
      { ref: { isA: true }, newThing: true },
      { ref: { isB: true } },
    ])
  })

  it('keeps old data of refs when modifying an item', async () => {
    await bind('items', collection)
    await first.update({ newThing: true })

    expect(target.items.value[0]).toEqual({
      ref: { isA: true },
      newThing: true,
    })
  })

  it('does not lose empty references in objects when updating a property', async () => {
    // @ts-ignore
    const items: firestore.CollectionReference = db.collection()
    const emptyItem = collection.doc()
    const item = await items.add({ o: { ref: emptyItem }, toggle: true })
    await bind('items', items)
    expect(target.items.value).toEqual([
      {
        o: { ref: null },
        toggle: true,
      },
    ])
    await items.add({ foo: 'bar' })
    expect(target.items.value).toEqual([
      {
        o: { ref: null },
        toggle: true,
      },
      { foo: 'bar' },
    ])
    await item.update({ toggle: false })
    expect(target.items.value).toEqual([
      {
        o: { ref: null },
        toggle: false,
      },
      { foo: 'bar' },
    ])
  })

  it('does not lose empty references in arrays when updating a property', async () => {
    // @ts-ignore
    const items: firestore.CollectionReference = db.collection()
    const emptyItem = collection.doc()
    const item = await items.add({ a: [emptyItem], toggle: true })
    await bind('items', items)
    expect(target.items.value).toEqual([
      {
        a: [null],
        toggle: true,
      },
    ])
    await items.add({ foo: 'bar' })
    expect(target.items.value).toEqual([
      {
        a: [null],
        toggle: true,
      },
      { foo: 'bar' },
    ])
    await item.update({ toggle: false })
    expect(target.items.value).toEqual([
      {
        a: [null],
        toggle: false,
      },
      { foo: 'bar' },
    ])
  })

  it('keeps array of references when updating a property', async () => {
    // @ts-ignore
    const items: firestore.CollectionReference = db.collection()
    const c = collection.doc()
    const item = await items.add({ a: [a, b, c, { foo: 'bar' }], toggle: true })
    await bind('items', items)
    expect(target.items.value).toEqual([
      {
        a: [{ isA: true }, { isB: true }, null, { foo: 'bar' }],
        toggle: true,
      },
    ])
    await items.add({ foo: 'bar' })
    expect(target.items.value).toEqual([
      {
        a: [{ isA: true }, { isB: true }, null, { foo: 'bar' }],
        toggle: true,
      },
      { foo: 'bar' },
    ])
    await item.update({ toggle: false })
    expect(target.items.value).toEqual([
      {
        a: [{ isA: true }, { isB: true }, null, { foo: 'bar' }],
        toggle: false,
      },
      { foo: 'bar' },
    ])
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
    expect(target.items.value).toEqual([
      {
        a: {
          b: b.path,
        },
      },
    ])

    // @ts-ignore
    await bind('items', collection, { maxRefDepth: 3 })
    expect(target.items.value).toEqual([
      {
        a: {
          b: {
            c: {
              d: d.path,
            },
          },
        },
      },
    ])
  })

  it('does not fail with cyclic refs', async () => {
    const item = db.collection().doc()
    await item.set({ item })
    const collection = db.collection()
    await collection.add({ item })
    // @ts-ignore
    await bind('items', collection, { maxRefDepth: 5 })

    expect(target.items.value).toEqual([
      {
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
      },
    ])
  })
})
