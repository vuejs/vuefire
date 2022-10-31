import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import {
  databasePlugin,
  DatabasePluginOptions,
  DatabaseSnapshotSerializer,
} from '../../src'
import { setupDatabaseRefs } from '../utils'

const component = defineComponent({ template: 'no' })

describe('RTDB: plugin options', () => {
  const { databaseRef, push } = setupDatabaseRefs()

  it('allows customizing $rtdbBind', () => {
    const wrapper = mount(component, {
      global: {
        plugins: [
          [
            databasePlugin,
            {
              bindName: '$myBind',
              unbindName: '$myUnbind',
            },
          ],
        ],
      },
    })
    expect(typeof (wrapper.vm as any).$myBind).toBe('function')
    expect(typeof (wrapper.vm as any).$myUnbind).toBe('function')
  })

  it('calls custom serialize function with a ref', async () => {
    const pluginOptions: DatabasePluginOptions = {
      serialize: vi.fn(() => ({ id: '2', foo: 'bar' })),
    }
    const { vm } = mount(
      {
        template: 'no',
        data: () => ({ items: [] }),
      },
      {
        global: {
          plugins: [[databasePlugin, pluginOptions]],
        },
      }
    )

    const itemListRef = databaseRef()

    const p = vm.$rtdbBind('items', itemListRef)
    await push(itemListRef, { text: 'foo' })

    expect(pluginOptions.serialize).toHaveBeenCalledTimes(1)
    expect(pluginOptions.serialize).toHaveBeenCalledWith(
      expect.objectContaining({ val: expect.any(Function) })
    )
    expect(vm.items).toEqual([{ foo: 'bar', id: '2' }])
  })

  it('can override serialize with local option', async () => {
    const pluginOptions: DatabasePluginOptions = {
      serialize: vi.fn(() => ({ id: '2', foo: 'bar' })),
    }

    const items = databaseRef()
    const { vm } = mount(
      {
        template: 'no',
        data: () => ({ items: [] }),
      },
      {
        global: {
          plugins: [[databasePlugin, pluginOptions]],
        },
      }
    )

    const spy: DatabaseSnapshotSerializer = vi.fn(() => ({
      id: '3',
      bar: 'bar',
    }))

    vm.$rtdbBind('items', items, { serialize: spy })
    await push(items, { text: 'foo' })

    expect(pluginOptions.serialize).not.toHaveBeenCalled()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ val: expect.any(Function) })
    )
    expect(vm.items).toEqual([{ bar: 'bar', id: '3' }])
  })
})
