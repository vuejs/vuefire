import { rtdbPlugin } from '../../src'
import { Vue, tick, MockFirebase } from '@posva/vuefire-test-helpers'

Vue.use(rtdbPlugin)

describe('RTDB: manual bind', () => {
  let source, vm
  beforeEach(async () => {
    source = new MockFirebase().child('data')
    vm = new Vue({
      // purposely set items as null
      // but it's a good practice to set it to an empty array
      data: () => ({
        items: [],
        item: null,
      }),
    })
    await tick()
  })

  it('manually binds as an array', async () => {
    expect(vm.items).toEqual([])
    const promise = vm.$rtdbBind('items', source)
    expect(vm.items).toEqual([])
    source.push({ text: 'foo' })
    source.flush()
    await promise
    expect(vm.items).toEqual([{ text: 'foo' }])
  })

  it('removes children in arrays', async () => {
    source.autoFlush()
    source.push({ name: 'one' })
    source.push({ name: 'two' })

    await vm.$rtdbBind('items', source)
    source.child(vm.items[1]['.key']).remove()
    expect(vm.items).toEqual([{ name: 'one' }])
  })

  it('returs a promise', () => {
    expect(vm.$rtdbBind('items', source) instanceof Promise).toBe(true)
    expect(vm.$rtdbBind('item', source) instanceof Promise).toBe(true)
  })

  it('manually binds as an object', async () => {
    expect(vm.item).toEqual(null)
    const promise = vm.$rtdbBind('item', source)
    expect(vm.item).toEqual(null)
    source.set({ text: 'foo' })
    source.flush()
    await promise
    expect(vm.item).toEqual({ text: 'foo' })
  })

  it('unbinds when overriting existing bindings', async () => {
    source.autoFlush()
    source.set({ name: 'foo' })
    await vm.$rtdbBind('item', source)
    expect(vm.item).toEqual({ name: 'foo' })
    const other = new MockFirebase().child('other')
    other.autoFlush()
    other.set({ name: 'bar' })
    await vm.$rtdbBind('item', other)
    expect(vm.item).toEqual({ name: 'bar' })

    source.set({ name: 'new foo' })
    expect(vm.item).toEqual({ name: 'bar' })
  })

  it('manually unbinds a ref', async () => {
    source.autoFlush()
    source.set({ name: 'foo' })
    await vm.$rtdbBind('item', source)
    expect(vm.item).toEqual({ name: 'foo' })
    vm.$rtdbUnbind('item')
    source.set({ name: 'bar' })
    expect(vm.item).toEqual(null)
  })
})
