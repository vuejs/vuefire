import Vuefire from '../src'
import {
  db,
  tick,
  delay,
  spyUnbind,
  spyOnSnapshot,
  spyOnSnapshotCallback,
  Vue
} from './helpers'

Vue.use(Vuefire)

let vm, collection, a, b, c, d
beforeEach(async () => {
  collection = db.collection()
  a = db.collection().doc()
  b = db.collection().doc()
  c = collection.doc()
  d = collection.doc()
  await c.update({ c: true })
  await d.update({ ref: c })

  vm = new Vue({
    data: () => ({
      a: null,
      b: null,
      c: null,
      d: null,
      item: null
    }),

    firestore: {
      a,
      b,
      c,
      d
    }
  })
  await tick()
  // wait for refs to be ready as well
  await delay(5)
})

test('binds refs on documents', async () => {
  // create an empty doc and update using the ref instead of plain data
  const c = collection.doc()
  await c.update({ foo: 'foo' })
  await a.update({ ref: c })

  // NOTE(1) need to wait because we updated with a ref
  await delay(5)

  expect(vm.a).toEqual({
    ref: { foo: 'foo' }
  })
})

test('binds refs nested in documents (objects)', async () => {
  const item = collection.doc()
  await item.update({
    obj: {
      ref: c
    }
  })
  await vm.$bind('item', item)

  expect(vm.item).toEqual({
    obj: {
      ref: { c: true }
    }
  })
})

test('binds refs deeply nested in documents (objects)', async () => {
  const item = collection.doc()
  await item.update({
    obj: {
      nested: {
        ref: c
      }
    }
  })
  await vm.$bind('item', item)

  expect(vm.item).toEqual({
    obj: {
      nested: {
        ref: {
          c: true
        }
      }
    }
  })
})

test('update inner ref', async () => {
  expect(vm.d).toEqual({
    ref: {
      c: true
    }
  })

  await c.update({ c: false })

  expect(vm.d).toEqual({
    ref: {
      c: false
    }
  })
})

test('is null if ref does not exist', async () => {
  await d.update({ ref: a })

  // NOTE see #1
  await delay(5)

  expect(vm.d).toEqual({
    ref: null
  })
})

test('unbinds previously bound document when overwriting a bound', async () => {
  const c = collection.doc()

  // Mock c onSnapshot to spy when the callback is called
  const spy = spyOnSnapshotCallback(c)
  await c.update({ baz: 'baz' })
  await d.update({ ref: c })
  // NOTE see #1
  await delay(5)
  expect(spy).toHaveBeenCalledTimes(1)
  await c.update({ baz: 'bar' })
  // make sure things are updating correctly
  expect(vm.d).toEqual({
    ref: { baz: 'bar' }
  })
  // we call update twice to make sure our mock works
  expect(spy).toHaveBeenCalledTimes(2)
  await d.update({ ref: a })
  // NOTE see #1
  await delay(5)

  expect(vm.d).toEqual({
    ref: null
  })
  await c.update({ foo: 'bar' })

  expect(spy).toHaveBeenCalledTimes(2)
  expect(vm.d).toEqual({
    ref: null
  })
  spy.mockRestore()
})

test('does not rebind if it is the same ref', async () => {
  const c = collection.doc()

  const spy = spyOnSnapshot(c)
  await c.update({ baz: 'baz' })
  await d.update({ ref: c })
  // NOTE see #1
  await delay(5)
  expect(spy).toHaveBeenCalledTimes(1)

  await d.update({ ref: c })
  await delay(5)

  expect(spy).toHaveBeenCalledTimes(1)
  spy.mockRestore()
})

test('resolves the promise when refs are resolved in a document', async () => {
  await a.update({ a: true })
  await b.update({ ref: a })

  await vm.$bind('item', b)
  expect(vm.item).toEqual({ ref: { a: true }})
})

test('resolves the promise when nested refs are resolved in a document', async () => {
  await a.update({ a: b })
  await b.update({ b: true })
  await d.update({ ref: a })

  await vm.$bind('item', d)
  expect(vm.item).toEqual({ ref: { a: { b: true }}})
})

test('resolves the promise when nested non-existant refs are resolved in a document', async () => {
  await a.update({ a: b })
  await d.update({ ref: a })

  await vm.$bind('item', d)
  expect(vm.item).toEqual({ ref: { a: null }})
})

test('resolves the promise when the document does not exist', async () => {
  expect(vm.item).toEqual(null)
  await vm.$bind('item', a)
  expect(vm.item).toBe(null)
})

test('unbinds all refs when the document is unbound', async () => {
  const cSpy = spyUnbind(c)
  const dSpy = spyUnbind(d)
  // rebind to use the spies
  await vm.$bind('d', d)
  expect(vm.d).toEqual({
    ref: {
      c: true
    }
  })
  vm.$unbind('d')

  expect(dSpy.mock.calls.length).toBe(1)
  expect(cSpy.mock.calls.length).toBe(1)

  cSpy.mockRestore()
  dSpy.mockRestore()
})

test('unbinds nested refs when the document is unbound', async () => {
  const c = collection.doc()
  const d = collection.doc()
  const aSpy = spyUnbind(a)
  const cSpy = spyUnbind(c)
  const dSpy = spyUnbind(d)

  await a.update({ a: true })
  await c.update({ ref: a })
  await d.update({ ref: c })

  await vm.$bind('d', d)
  expect(vm.d).toEqual({
    ref: {
      ref: {
        a: true
      }
    }
  })
  vm.$unbind('d')

  expect(dSpy.mock.calls.length).toBe(1)
  expect(cSpy.mock.calls.length).toBe(1)
  expect(aSpy.mock.calls.length).toBe(1)

  aSpy.mockRestore()
  cSpy.mockRestore()
  dSpy.mockRestore()
})

test('unbinds multiple refs when the document is unbound', async () => {
  const c = collection.doc()
  const d = collection.doc()
  const aSpy = spyUnbind(a)
  const cSpy = spyUnbind(c)
  const dSpy = spyUnbind(d)

  await a.update({ a: true })
  await c.update({ c: true })
  await d.update({ c, a })

  await vm.$bind('d', d)
  expect(vm.d).toEqual({
    a: { a: true },
    c: { c: true }
  })
  vm.$unbind('d')

  expect(dSpy.mock.calls.length).toBe(1)
  expect(cSpy.mock.calls.length).toBe(1)
  expect(aSpy.mock.calls.length).toBe(1)

  aSpy.mockRestore()
  cSpy.mockRestore()
  dSpy.mockRestore()
})

test('unbinds when a ref is replaced', async () => {
  const aSpy = spyUnbind(a)
  const cSpy = spyUnbind(c)
  const dSpy = spyUnbind(d)

  await a.update({ a: true })

  await vm.$bind('d', d)
  expect(vm.d).toEqual({
    ref: {
      c: true
    }
  })

  await d.update({ ref: a })
  // NOTE see #1
  await delay(5)
  expect(vm.d).toEqual({
    ref: {
      a: true
    }
  })

  // expect(dSpy.mock.calls.length).toBe(1)
  expect(cSpy.mock.calls.length).toBe(1)
  expect(aSpy.mock.calls.length).toBe(0)

  aSpy.mockRestore()
  cSpy.mockRestore()
  dSpy.mockRestore()
})

test('unbinds removed properties', async () => {
  const a = db.collection().doc()
  const b = db.collection().doc()
  const unbindSpy = spyUnbind(a)
  const callbackSpy = spyOnSnapshotCallback(a)
  const onSnapshotSpy = spyOnSnapshot(a)

  const item = db.collection().doc()
  await a.update({ isA: true })
  await b.update({ isB: true })
  await item.update({ a })

  expect(unbindSpy).toHaveBeenCalledTimes(0)
  expect(callbackSpy).toHaveBeenCalledTimes(0)
  expect(onSnapshotSpy).toHaveBeenCalledTimes(0)
  await vm.$bind('item', item)
  expect(vm.item).toEqual({
    a: {
      isA: true
    }
  })

  expect(unbindSpy).toHaveBeenCalledTimes(0)
  expect(callbackSpy).toHaveBeenCalledTimes(1)
  expect(onSnapshotSpy).toHaveBeenCalledTimes(1)

  await item.set({ b })
  await a.update({ newA: true })
  // NOTE see #1
  await delay(5)

  expect(vm.item).toEqual({
    b: {
      isB: true
    }
  })

  expect(unbindSpy).toHaveBeenCalledTimes(1)
  expect(callbackSpy).toHaveBeenCalledTimes(1)
  expect(onSnapshotSpy).toHaveBeenCalledTimes(1)

  unbindSpy.mockRestore()
  callbackSpy.mockRestore()
  onSnapshotSpy.mockRestore()
})
