import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import {
  FirestoreOption,
  firestorePlugin,
  FirestorePluginOptions,
} from '../../src'
import { DocumentData } from 'firebase/firestore'
import { setupFirestoreRefs } from '../utils'

const component = defineComponent({
  template: 'no',
  data: () => ({ itemList: [], item: null }),
})

describe('Firestore: Options API', () => {
  const { collection, doc, addDoc, setDoc } = setupFirestoreRefs()

  describe('$firestoreBind', () => {
    function factory(pluginOptions?: FirestorePluginOptions) {
      return mount(component, {
        global: {
          plugins: [[firestorePlugin, pluginOptions]],
        },
      })
    }

    it('allows customizing $rtdbBind', () => {
      const wrapper = factory({
        bindName: '$myBind',
        unbindName: '$myUnbind',
      })

      // @ts-expect-error: haven't extended the types
      expect(wrapper.vm.$myBind).toBeTypeOf('function')
      // @ts-expect-error: haven't extended the types
      expect(wrapper.vm.$myUnbind).toBeTypeOf('function')
    })

    it('calls custom serialize function with collection', async () => {
      const fromFirestore = vi.fn(() => ({
        foo: 'bar',
      }))
      const wrapper = factory({
        converter: {
          fromFirestore,
          toFirestore: (data: DocumentData) => data,
        },
      })

      const itemsRef = collection()
      await addDoc(itemsRef, {})

      await wrapper.vm.$firestoreBind('itemList', itemsRef)

      expect(fromFirestore).toHaveBeenCalledTimes(1)
      expect(fromFirestore).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Function) }),
        expect.anything()
      )
      expect(wrapper.vm.itemList).toEqual([{ foo: 'bar' }])
    })

    it('can be overridden by local option', async () => {
      const fromFirestore = vi.fn(() => ({
        foo: 'bar',
      }))
      const wrapper = factory({
        converter: {
          fromFirestore,
          toFirestore: (data: DocumentData) => data,
        },
      })

      const itemsRef = collection()
      await addDoc(itemsRef, {})

      const spy = vi.fn(() => ({ bar: 'bar' }))

      await wrapper.vm.$firestoreBind(
        'itemList',
        itemsRef.withConverter({
          fromFirestore: spy,
          toFirestore(data: DocumentData) {
            return data
          },
        }),
        {}
      )

      expect(fromFirestore).not.toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Function) }),
        expect.anything()
      )
      expect(wrapper.vm.itemList).toEqual([{ bar: 'bar' }])
    })
  })

  describe('firestore option', () => {
    function factory(
      firestore: FirestoreOption,
      pluginOptions?: FirestorePluginOptions
    ) {
      return mount(component, {
        firestore,
        global: {
          plugins: [[firestorePlugin, pluginOptions]],
        },
      })
    }

    it('setups $firestoreRefs', async () => {
      const itemSource = doc()
      const itemListSource = collection()
      const { vm } = factory({ item: itemSource, itemList: itemListSource })
      expect(Object.keys(vm.$firestoreRefs).sort()).toEqual([
        'item',
        'itemList',
      ])
      expect(vm.$firestoreRefs.item.path).toBe(itemSource.path)
      expect(vm.$firestoreRefs.itemList.path).toBe(itemListSource.path)
    })

    it('clears $firestoreRefs on unmount', async () => {
      const itemSource = doc()
      const itemListSource = collection()
      const wrapper = factory({ item: itemSource, itemList: itemListSource })
      wrapper.unmount()
      expect(wrapper.vm.$firestoreRefs).toEqual(null)
    })
  })
})
