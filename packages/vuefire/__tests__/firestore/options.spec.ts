import { firestorePlugin } from '../../src'
import { db, Vue } from '@posva/vuefire-test-helpers'

const createLocalVue = () => {
  const newVue = Vue.extend()
  newVue.config = Vue.config
  return newVue
}

describe('Firestore: plugin options', () => {
  it('allows customizing $rtdbBind', () => {
    const LocalVue = createLocalVue()
    LocalVue.use(firestorePlugin, {
      bindName: '$myBind',
      unbindName: '$myUnbind',
    })
    expect(typeof LocalVue.prototype.$myBind).toBe('function')
    expect(typeof LocalVue.prototype.$myUnbind).toBe('function')
  })

  it('calls custom serialize function with collection', async () => {
    const LocalVue = createLocalVue()
    const pluginOptions = {
      serialize: jest.fn(() => ({ foo: 'bar' })),
    }
    LocalVue.use(firestorePlugin, pluginOptions)

    // @ts-ignore
    const items: firestore.CollectionReference = db.collection()
    await items.add({})

    const vm = new LocalVue({
      data: () => ({ items: [] }),
    })

    await vm.$bind('items', items)

    expect(pluginOptions.serialize).toHaveBeenCalledTimes(1)
    expect(pluginOptions.serialize).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Function) })
    )
    expect(vm.items).toEqual([{ foo: 'bar' }])
  })

  it('can be ovrriden by local option', async () => {
    const LocalVue = createLocalVue()
    const pluginOptions = {
      serialize: jest.fn(() => ({ foo: 'bar' })),
    }
    LocalVue.use(firestorePlugin, pluginOptions)

    // @ts-ignore
    const items: firestore.CollectionReference = db.collection()
    await items.add({})

    const vm = new LocalVue({
      data: () => ({ items: [] }),
    })

    const spy = jest.fn(() => ({ bar: 'bar' }))

    await vm.$bind('items', items, { serialize: spy })

    expect(pluginOptions.serialize).not.toHaveBeenCalled()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ data: expect.any(Function) }))
    expect(vm.items).toEqual([{ bar: 'bar' }])
  })
})
