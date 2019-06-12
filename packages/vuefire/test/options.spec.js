import { firestorePlugin } from '../src'
import { db, delay } from '@posva/vuefire-test-helpers'
import { createLocalVue } from '@vue/test-utils'

describe('Firestore: plugin options', () => {
  it('allows customizing $rtdbBind', () => {
    const Vue = createLocalVue()
    Vue.use(firestorePlugin, { bindName: '$myBind', unbindName: '$myUnbind' })
    expect(typeof Vue.prototype.$myBind).toBe('function')
    expect(typeof Vue.prototype.$myUnbind).toBe('function')
  })
  it('allows global use of a custom createSnapshot function', async () => {
    const Vue = createLocalVue()
    const pluginOptions = {
      createSnapshot: jest.fn((documentSnapshot) => {
        return {
          customId: documentSnapshot.id,
          globalIsBar: documentSnapshot.data().foo === 'bar',
          stuff: documentSnapshot.data()
        }
      })
    }
    Vue.use(firestorePlugin, pluginOptions)

    const items = db.collection()
    const item = items.doc()
    const itemMock = { foo: 'bar' }
    await item.set(itemMock)

    const vm = new Vue({
      data: () => ({ items: [] }),
      firestore: { items }
    })
    await delay(5)
    expect(pluginOptions.createSnapshot).toHaveBeenCalledTimes(1)
    expect(Array.isArray(vm.items)).toBe(true)
    expect(vm.items[0]).toEqual({ customId: '0', globalIsBar: true, stuff: itemMock })
  })
})
