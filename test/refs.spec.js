import Vuefire from '../src'
import {
  db,
  tick,
  delay,
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
    render: h => h(),
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
  // XXX dirty hack until $bind resolves when all refs are bound
  // NOTE should add option for it waitForRefs: true (by default)
  await delay(5)
})

test('binds refs on documents', async () => {
  // create an empty doc and update using the ref instead of plain data
  const c = collection.doc()
  await c.update({ foo: 'foo' })
  await a.update({ ref: c })

  // XXX dirty hack until $bind resolves when all refs are bound
  // NOTE should add option for it waitForRefs: true (by default)
  await delay(5)

  expect(vm.a).toEqual({
    ref: { foo: 'foo' }
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

  await delay(5)

  expect(vm.d).toEqual({
    ref: null
  })
})

test('unbinds previously bound document when overwriting a bound', async () => {
  const c = collection.doc()

  // Mock c onSnapshot to spy when the callback is called
  const spy = jest.fn()
  const onSnapshot = c.onSnapshot.bind(c)
  c.onSnapshot = jest.fn(fn => onSnapshot((...args) => {
    spy()
    fn(...args)
  }))
  await c.update({ baz: 'baz' })
  await d.update({ ref: c })
  await delay(5)
  expect(spy).toHaveBeenCalledTimes(1)
  await c.update({ baz: 'bar' })
  await delay(5)
  // make sure things are updating correctly
  expect(vm.d).toEqual({
    ref: { baz: 'bar' }
  })
  // we call update twice to make sure our mock works
  expect(spy).toHaveBeenCalledTimes(2)
  await d.update({ ref: a })
  await delay(5)

  expect(vm.d).toEqual({
    ref: null
  })
  await c.update({ foo: 'bar' })
  await delay(5)

  expect(spy).toHaveBeenCalledTimes(2)
  expect(vm.d).toEqual({
    ref: null
  })
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

function spyUnbind (ref) {
  const spy = jest.fn()
  const onSnapshot = ref.onSnapshot.bind(ref)
  ref.onSnapshot = jest.fn(fn => {
    const unbind = onSnapshot(fn)
    return () => {
      spy()
      unbind()
    }
  })
  return spy
}

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
