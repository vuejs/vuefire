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
        item: null
      })
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
})
