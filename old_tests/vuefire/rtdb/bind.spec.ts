import { mount } from '@vue/test-utils'
import { rtdbPlugin } from '../../../src'
import { tick, MockFirebase } from '../../src'

describe('RTDB: manual bind', () => {
  async function factory() {
    const source = new MockFirebase().child('data')
    const wrapper = mount(
      {
        template: 'no',
        // purposely set items as null
        // but it's a good practice to set it to an empty array
        data: () => ({
          items: [],
          item: null,
        }),
      },
      {
        global: {
          plugins: [rtdbPlugin],
        },
      }
    )

    await tick()

    return { wrapper, source }
  }

  it('manually binds as an array', async () => {
    const { wrapper, source } = await factory()
    expect(wrapper.vm.items).toEqual([])
    const promise = wrapper.vm.$rtdbBind('items', source)
    expect(wrapper.vm.items).toEqual([])
    source.push({ text: 'foo' })
    source.flush()
    await promise
    expect(wrapper.vm.items).toEqual([{ text: 'foo' }])
  })

  it('removes children in arrays', async () => {
    const { wrapper, source } = await factory()
    source.autoFlush()
    source.push({ name: 'one' })
    source.push({ name: 'two' })

    await wrapper.vm.$rtdbBind('items', source)
    source.child(wrapper.vm.items[1]['.key']).remove()
    expect(wrapper.vm.items).toEqual([{ name: 'one' }])
  })

  it('returs a promise', async () => {
    const { wrapper, source } = await factory()
    expect(wrapper.vm.$rtdbBind('items', source) instanceof Promise).toBe(true)
    expect(wrapper.vm.$rtdbBind('item', source) instanceof Promise).toBe(true)
  })

  it('manually binds as an object', async () => {
    const { wrapper, source } = await factory()
    expect(wrapper.vm.item).toEqual(null)
    const promise = wrapper.vm.$rtdbBind('item', source)
    expect(wrapper.vm.item).toEqual(null)
    source.set({ text: 'foo' })
    source.flush()
    await promise
    expect(wrapper.vm.item).toEqual({ text: 'foo' })
  })

  it('unbinds when overriting existing bindings', async () => {
    const { wrapper, source } = await factory()
    source.autoFlush()
    source.set({ name: 'foo' })
    await wrapper.vm.$rtdbBind('item', source)
    expect(wrapper.vm.item).toEqual({ name: 'foo' })
    const other = new MockFirebase().child('other')
    other.autoFlush()
    other.set({ name: 'bar' })
    await wrapper.vm.$rtdbBind('item', other)
    expect(wrapper.vm.item).toEqual({ name: 'bar' })

    source.set({ name: 'new foo' })
    expect(wrapper.vm.item).toEqual({ name: 'bar' })
  })

  it('manually unbinds a ref', async () => {
    const { wrapper, source } = await factory()
    source.autoFlush()
    source.set({ name: 'foo' })
    await wrapper.vm.$rtdbBind('item', source)
    expect(wrapper.vm.item).toEqual({ name: 'foo' })
    wrapper.vm.$rtdbUnbind('item')
    source.set({ name: 'bar' })
    expect(wrapper.vm.item).toEqual(null)
  })

  it('can customize the reset option through $rtdbBind', async () => {
    const { wrapper, source } = await factory()
    const otherSource = new MockFirebase().child('data2')
    source.set({ name: 'foo' })
    otherSource.set({ name: 'bar' })
    let p = wrapper.vm.$rtdbBind('item', source)
    source.flush()
    await p
    p = wrapper.vm.$rtdbBind('item', otherSource, { reset: false })
    expect(wrapper.vm.item).toEqual({ name: 'foo' })
    otherSource.flush()
    await p
    expect(wrapper.vm.item).toEqual({ name: 'bar' })
    // should not apply last used option
    p = wrapper.vm.$rtdbBind('item', source)
    expect(wrapper.vm.item).toEqual(null)
    source.flush()
  })

  it('can customize the reset option through $rtdbUnbind', async () => {
    const { wrapper, source } = await factory()
    source.autoFlush()
    source.set({ name: 'foo' })
    const otherSource = new MockFirebase().child('data2')
    otherSource.set({ name: 'bar' })
    otherSource.autoFlush()
    await wrapper.vm.$rtdbBind('item', source)
    expect(wrapper.vm.item).toEqual({ name: 'foo' })
    wrapper.vm.$rtdbUnbind('item', false)
    expect(wrapper.vm.item).toEqual({ name: 'foo' })
    // should not apply the option to the next unbind call
    await wrapper.vm.$rtdbBind('item', otherSource, { reset: false })
    expect(wrapper.vm.item).toEqual({ name: 'bar' })
    wrapper.vm.$rtdbUnbind('item')
    expect(wrapper.vm.item).toEqual(null)
  })

  it('do not reset if wait: true', async () => {
    const { wrapper, source } = await factory()
    const otherSource = new MockFirebase().child('data2')

    // source.autoFlush()
    let p = wrapper.vm.$rtdbBind('items', source)
    source.push({ name: 'foo' })
    source.flush()
    await p
    p = wrapper.vm.$rtdbBind('items', otherSource, { wait: true, reset: true })
    expect(wrapper.vm.items).toEqual([{ name: 'foo' }])
    otherSource.push({ name: 'bar' })
    otherSource.flush()
    await p
    expect(wrapper.vm.items).toEqual([{ name: 'bar' }])
  })

  it('wait + reset can be overriden with a function', async () => {
    const { wrapper, source } = await factory()
    const otherSource = new MockFirebase().child('data2')

    // source.autoFlush()
    let p = wrapper.vm.$rtdbBind('items', source)
    source.push({ name: 'foo' })
    source.flush()
    await p
    // using an array is important as we use that to choose between bindAsObject and bindAsArray
    p = wrapper.vm.$rtdbBind('items', otherSource, {
      wait: true,
      reset: () => ['foo'],
    })
    expect(wrapper.vm.items).toEqual(['foo'])
    otherSource.push({ name: 'bar' })
    otherSource.flush()
    await p
    expect(wrapper.vm.items).toEqual([{ name: 'bar' }])
  })
})
