import { mount } from '@vue/test-utils'
import { rtdbPlugin } from '../../../src'
import { MockFirebase } from '../../src'

describe('RTDB: plugin options', () => {
  it('allows customizing $rtdbBind', () => {
    const wrapper = mount(
      { template: 'n' },
      {
        global: {
          plugins: [
            [
              rtdbPlugin,
              {
                bindName: '$myBind',
                unbindName: '$myUnbind',
              },
            ],
          ],
        },
      }
    )
    expect(typeof (wrapper.vm as any).$myBind).toBe('function')
    expect(typeof (wrapper.vm as any).$myUnbind).toBe('function')
  })

  it('calls custom serialize function with collection', async () => {
    const pluginOptions = {
      serialize: jest.fn(() => ({ foo: 'bar' })),
    }
    const { vm } = mount(
      {
        template: 'no',
        data: () => ({ items: [] }),
      },
      {
        global: {
          plugins: [[rtdbPlugin, pluginOptions]],
        },
      }
    )

    const items = new MockFirebase().child('data')

    const p = vm.$rtdbBind('items', items)
    items.push({ text: 'foo' })
    items.flush()

    await p

    expect(pluginOptions.serialize).toHaveBeenCalledTimes(1)
    expect(pluginOptions.serialize).toHaveBeenCalledWith(
      // @ts-ignore WTF TS?????
      expect.objectContaining({ val: expect.any(Function) })
    )
    expect(vm.items).toEqual([{ foo: 'bar' }])
  })

  it('can be ovrriden by local option', async () => {
    const pluginOptions = {
      serialize: jest.fn(() => ({ foo: 'bar' })),
    }

    const items = new MockFirebase().child('data')
    const { vm } = mount(
      {
        template: 'no',
        data: () => ({ items: [] }),
      },
      {
        global: {
          plugins: [[rtdbPlugin, pluginOptions]],
        },
      }
    )

    const spy = jest.fn(() => ({ bar: 'bar' }))

    const p = vm.$rtdbBind('items', items, { serialize: spy })
    items.push({ text: 'foo' })
    items.flush()

    await p

    expect(pluginOptions.serialize).not.toHaveBeenCalled()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      // @ts-ignore WTF TS?????
      expect.objectContaining({ val: expect.any(Function) })
    )
    expect(vm.items).toEqual([{ bar: 'bar' }])
  })
})
