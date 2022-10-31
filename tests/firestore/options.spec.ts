import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { firestorePlugin, FirestorePluginOptions } from '../../src'
import { addDoc, DocumentData } from 'firebase/firestore'
import { setupFirestoreRefs } from '../utils'

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
    const pluginOptions: FirestorePluginOptions = {
      converter: {
        fromFirestore: vi.fn((snapshot, options?) => ({
          foo: 'bar',
        })),
        toFirestore(data: DocumentData) {
          return data
        },
      },
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

    await wrapper.vm.$firestoreBind('items', itemsRef)

    expect(pluginOptions.converter?.fromFirestore).toHaveBeenCalledTimes(1)
    expect(pluginOptions.converter?.fromFirestore).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Function) }),
      expect.anything()
    )
    expect(wrapper.vm.items).toEqual([{ foo: 'bar' }])
  })

  it('can be overridden by local option', async () => {
    const pluginOptions: FirestorePluginOptions = {
      converter: {
        fromFirestore: vi.fn((snapshot, options?) => ({
          foo: 'bar',
        })),
        toFirestore(data: DocumentData) {
          return data
        },
      },
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

    await wrapper.vm.$firestoreBind(
      'items',
      itemsRef.withConverter({
        fromFirestore: spy,
        toFirestore(data: DocumentData) {
          return data
        },
      }),
      {}
    )

    expect(pluginOptions.converter?.fromFirestore).not.toHaveBeenCalled()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Function) }),
      expect.anything()
    )
    expect(wrapper.vm.items).toEqual([{ bar: 'bar' }])
  })
})
