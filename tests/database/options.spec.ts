import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import {
  databasePlugin,
  DatabasePluginOptions,
  DatabaseSnapshotSerializer,
  FirebaseOption,
} from '../../src'
import { setupDatabaseRefs } from '../utils'

const component = defineComponent({
  template: 'no',
  data: () => ({ itemList: [], item: null }),
})

describe('RTDB: plugin options', () => {
  const { databaseRef, push } = setupDatabaseRefs()

  describe('$databaseBind', () => {
    function factory(pluginOptions?: DatabasePluginOptions) {
      return mount(component, {
        global: {
          plugins: [[databasePlugin, pluginOptions]],
        },
      })
    }

    it('allows customizing $databaseBind', () => {
      const wrapper = factory({
        bindName: '$myBind',
        unbindName: '$myUnbind',
      })
      expect(typeof (wrapper.vm as any).$myBind).toBe('function')
      expect(typeof (wrapper.vm as any).$myUnbind).toBe('function')
    })

    it('returns a promise', async () => {
      const serialize = vi.fn(() => ({ id: '2', foo: 'bar' }))
      const { vm } = factory({ serialize })
      const itemListRef = databaseRef()

      const p = vm.$databaseBind('itemList', itemListRef)
      expect(p).toBeInstanceOf(Promise)
      await expect(p).resolves.toHaveLength(0)
    })

    it('calls custom serialize function with a ref', async () => {
      const serialize = vi.fn(() => ({ id: '2', foo: 'bar' }))
      const { vm } = factory({ serialize })

      const itemListRef = databaseRef()

      const p = vm.$databaseBind('itemList', itemListRef)
      await p
      await push(itemListRef, { text: 'foo' })

      expect(serialize).toHaveBeenCalledTimes(1)
      expect(serialize).toHaveBeenCalledWith(
        expect.objectContaining({ val: expect.any(Function) })
      )
      expect(vm.itemList).toEqual([{ foo: 'bar', id: '2' }])
    })

    it('can override serialize with local option', async () => {
      const serialize = vi.fn(() => ({ id: '2', foo: 'bar' }))
      const items = databaseRef()
      const { vm } = factory({ serialize })

      const spy: DatabaseSnapshotSerializer = vi.fn(() => ({
        id: '3',
        bar: 'bar',
      }))

      vm.$databaseBind('itemList', items, { serialize: spy })
      await push(items, { text: 'foo' })

      expect(serialize).not.toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ val: expect.any(Function) })
      )
      expect(vm.itemList).toEqual([{ bar: 'bar', id: '3' }])
    })
  })

  describe('firebase option', () => {
    function factory(
      firebase: FirebaseOption,
      pluginOptions?: DatabasePluginOptions
    ) {
      return mount(component, {
        firebase,
        global: {
          plugins: [[databasePlugin, pluginOptions]],
        },
      })
    }

    it('setups $firebaseRefs', async () => {
      const itemSource = databaseRef()
      const itemListSource = databaseRef()
      const { vm } = factory({ item: itemSource, itemList: itemListSource })
      expect(Object.keys(vm.$firebaseRefs).sort()).toEqual(['item', 'itemList'])
      expect(vm.$firebaseRefs.item.key).toBe(itemSource.key)
      expect(vm.$firebaseRefs.itemList.key).toBe(itemListSource.key)
    })

    it('clears $firebaseRefs on unmount', async () => {
      const itemSource = databaseRef()
      const itemListSource = databaseRef()
      const wrapper = factory({ item: itemSource, itemList: itemListSource })
      wrapper.unmount()
      expect(wrapper.vm.$firebaseRefs).toEqual(null)
    })
  })
})
