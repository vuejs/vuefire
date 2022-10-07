import { firestorePlugin } from '../../../src'
import { db } from '../../src'
import { mount } from '@vue/test-utils'
import * as firestore from '@firebase/firestore-types'
import { defineComponent } from 'vue'

const component = defineComponent({ template: 'no' })

describe('Firestore: plugin options', () => {
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
    expect(typeof (wrapper.vm as any).$myBind).toBe('function')
    expect(typeof (wrapper.vm as any).$myUnbind).toBe('function')
  })

  it('calls custom serialize function with collection', async () => {
    const pluginOptions = {
      serialize: jest.fn(() => ({ foo: 'bar' })),
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

    // @ts-ignore
    const items: firestore.CollectionReference = db.collection()
    await items.add({})

    await wrapper.vm.$bind('items', items)

    expect(pluginOptions.serialize).toHaveBeenCalledTimes(1)
    expect(pluginOptions.serialize).toHaveBeenCalledWith(
      // @ts-ignore WTF TS?????
      expect.objectContaining({ data: expect.any(Function) })
    )
    expect(wrapper.vm.items).toEqual([{ foo: 'bar' }])
  })

  it('can be overridden by local option', async () => {
    const pluginOptions = {
      serialize: jest.fn(() => ({ foo: 'bar' })),
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

    // @ts-ignore
    const items: firestore.CollectionReference = db.collection()
    await items.add({})

    const spy = jest.fn(() => ({ bar: 'bar' }))

    await wrapper.vm.$bind('items', items, { serialize: spy })

    expect(pluginOptions.serialize).not.toHaveBeenCalled()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      // @ts-ignore WTF TS?????
      expect.objectContaining({ data: expect.any(Function) })
    )
    expect(wrapper.vm.items).toEqual([{ bar: 'bar' }])
  })
})
