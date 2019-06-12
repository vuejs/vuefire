import { firestorePlugin } from '../src'
import { Vue, db, tick, delay } from '@posva/vuefire-test-helpers'

describe('Firestore: plugin options', () => {
  it('allows customizing $rtdbBind', () => {
    // Vue.use(firestorePlugin, { bindName: '$myBind', unbindName: '$myUnbind' })
    // expect(typeof Vue.prototype.$myBind).toBe('function')
    // expect(typeof Vue.prototype.$myUnbind).toBe('function')
  })
  it('allows global use of a custom createSnapshot function', async () => {
    const pluginOptions = {
      createSnapshot: jest.fn((documentSnapshot) => {
        return {
          customId: documentSnapshot.id,
          globalIsBar: documentSnapshot.data().data.foo === 'bar'
        }
      })
    }
    Vue.use(firestorePlugin, pluginOptions)

    const items = db.collection()
    const item = db.collection().doc()
    await item.set({ foo: 'bar' })
    await items.add(item)

    const vm = new Vue({
      data: () => ({ items: [] }),
      firestore: { items }
    })
    await delay(5)
    expect(pluginOptions.createSnapshot).toHaveBeenCalledTimes(1)
    expect(Array.isArray(vm.items)).toBe(true)
    expect(vm.items[0]).toEqual({ customId: '1', globalIsBar: true })
  })
})
