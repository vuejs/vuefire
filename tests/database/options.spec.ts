import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import {
  databasePlugin,
  DatabasePluginOptions,
  DatabaseSnapshotSerializer,
} from '../../src'
import { setupDatabaseRefs } from '../utils'

const component = defineComponent({
  template: 'no',
  data: () => ({ items: [], item: null }),
})

describe('RTDB: plugin options', () => {
  const { databaseRef, push } = setupDatabaseRefs()

  describe('$rtdbBind', () => {
    function factory(pluginOptions?: DatabasePluginOptions) {
      return mount(component, {
        global: {
          plugins: [[databasePlugin, pluginOptions]],
        },
      })
    }

    it('allows customizing $rtdbBind', () => {
      const wrapper = factory({
        bindName: '$myBind',
        unbindName: '$myUnbind',
      })
      expect(typeof (wrapper.vm as any).$myBind).toBe('function')
      expect(typeof (wrapper.vm as any).$myUnbind).toBe('function')
    })

    it('calls custom serialize function with a ref', async () => {
      const serialize = vi.fn(() => ({ id: '2', foo: 'bar' }))
      const { vm } = factory({ serialize })

      const itemListRef = databaseRef()

      const p = vm.$rtdbBind('items', itemListRef)
      await push(itemListRef, { text: 'foo' })

      expect(serialize).toHaveBeenCalledTimes(1)
      expect(serialize).toHaveBeenCalledWith(
        expect.objectContaining({ val: expect.any(Function) })
      )
      expect(vm.items).toEqual([{ foo: 'bar', id: '2' }])
    })

    it('can override serialize with local option', async () => {
      const serialize = vi.fn(() => ({ id: '2', foo: 'bar' }))
      const items = databaseRef()
      const { vm } = factory({ serialize })

      const spy: DatabaseSnapshotSerializer = vi.fn(() => ({
        id: '3',
        bar: 'bar',
      }))

      vm.$rtdbBind('items', items, { serialize: spy })
      await push(items, { text: 'foo' })

      expect(serialize).not.toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ val: expect.any(Function) })
      )
      expect(vm.items).toEqual([{ bar: 'bar', id: '3' }])
    })
  })

  // describe('firebase option', () => {})
})
