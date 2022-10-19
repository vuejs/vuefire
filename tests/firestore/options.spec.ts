import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { firestorePlugin, PluginOptions, useCollection } from '../../src'
import { addDoc, DocumentData } from 'firebase/firestore'
import { expectType, setupFirestoreRefs, tds, firestore } from '../utils'
import { usePendingPromises } from '../../src/vuefire/firestore'
import { type Ref } from 'vue'

const component = defineComponent({ template: 'no' })

describe('Firestore: Options API', () => {
  const { collection, doc } = setupFirestoreRefs()

  it('allows customizing $rtdbBind', () => {
    const wrapper = mount(component, {
      global: {
        plugins: [
          [
            firestorePlugin,
            {
              bindName: '$myBind',
              unbindName: '$myUnbind',
            },
          ],
        ],
      },
    })

    // @ts-expect-error: haven't extended the types
    expect(wrapper.vm.$myBind).toBeTypeOf('function')
    // @ts-expect-error: haven't extended the types
    expect(wrapper.vm.$myUnbind).toBeTypeOf('function')
  })

  it('calls custom serialize function with collection', async () => {
    const pluginOptions: PluginOptions = {
      serialize: vi.fn(() => ({ foo: 'bar' })),
    }
    const wrapper = mount(
      {
        template: 'no',
        data: () => ({ items: [] }),
      },
      {
        global: {
          plugins: [[firestorePlugin, pluginOptions]],
        },
      }
    )

    const itemsRef = collection()
    await addDoc(itemsRef, {})

    await wrapper.vm.$bind('items', itemsRef)

    expect(pluginOptions.serialize).toHaveBeenCalledTimes(1)
    expect(pluginOptions.serialize).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Function) })
    )
    expect(wrapper.vm.items).toEqual([{ foo: 'bar' }])
  })

  it('can be overridden by local option', async () => {
    const pluginOptions = {
      serialize: vi.fn(() => ({ foo: 'bar' })),
    }
    const wrapper = mount(
      {
        template: 'no',
        data: () => ({ items: [] }),
      },
      {
        global: {
          plugins: [[firestorePlugin, pluginOptions]],
        },
      }
    )

    const itemsRef = collection()
    await addDoc(itemsRef, {})

    const spy = vi.fn(() => ({ bar: 'bar' }))

    await wrapper.vm.$bind('items', itemsRef, { serialize: spy })

    expect(pluginOptions.serialize).not.toHaveBeenCalled()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Function) })
    )
    expect(wrapper.vm.items).toEqual([{ bar: 'bar' }])
  })
})
