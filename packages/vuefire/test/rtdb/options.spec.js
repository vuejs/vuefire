import { rtdbPlugin } from '../../src'
import { Vue, MockFirebase } from '@posva/vuefire-test-helpers'

const createLocalVue = () => {
  const newVue = Vue.extend()
  newVue.config = Vue.config
  return newVue
}

describe('RTDB: plugin options', () => {
  it('allows customizing $rtdbBind', () => {
    const LocalVue = createLocalVue()
    LocalVue.use(rtdbPlugin, { bindName: '$bind', unbindName: '$unbind' })
    expect(typeof LocalVue.prototype.$bind).toBe('function')
    expect(typeof LocalVue.prototype.$unbind).toBe('function')
  })

  it('calls custom serialize function with collection', async () => {
    const LocalVue = createLocalVue()
    const pluginOptions = {
      serialize: jest.fn(() => ({ foo: 'bar' }))
    }
    LocalVue.use(rtdbPlugin, pluginOptions)

    const items = new MockFirebase().child('data')
    const vm = new LocalVue({
      data: () => ({ items: [] })
    })

    const p = vm.$rtdbBind('items', items)
    items.push({ text: 'foo' })
    items.flush()

    await p

    expect(pluginOptions.serialize).toHaveBeenCalledTimes(1)
    expect(pluginOptions.serialize).toHaveBeenCalledWith(
      expect.objectContaining({ val: expect.any(Function) })
    )
    expect(vm.items).toEqual([{ foo: 'bar' }])
  })

  it('can be ovrriden by local option', async () => {
    const LocalVue = createLocalVue()
    const pluginOptions = {
      serialize: jest.fn(() => ({ foo: 'bar' }))
    }
    LocalVue.use(rtdbPlugin, pluginOptions)

    const items = new MockFirebase().child('data')
    const vm = new LocalVue({
      data: () => ({ items: [] })
    })

    const spy = jest.fn(() => ({ bar: 'bar' }))

    const p = vm.$rtdbBind('items', items, { serialize: spy })
    items.push({ text: 'foo' })
    items.flush()

    await p

    expect(pluginOptions.serialize).not.toHaveBeenCalled()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ val: expect.any(Function) })
    )
    expect(vm.items).toEqual([{ bar: 'bar' }])
  })
})
