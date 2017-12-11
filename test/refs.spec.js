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
  await c.update({ foo: 'foo' })
  await d.update({ ref: c })

  vm = new Vue({
    render (h) {
      return h('ul', this.items && this.items.map(
        item => h('li', [item])
      ))
    },
    data: () => ({
      a: null,
      b: null,
      c: null,
      d: null
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
      foo: 'foo'
    }
  })

  await c.update({ foo: 'bar' })

  expect(vm.d).toEqual({
    ref: {
      foo: 'bar'
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
  })
  )
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
