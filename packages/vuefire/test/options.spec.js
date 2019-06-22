import { firestorePlugin } from '../src'
import { db, delay, Vue } from '@posva/vuefire-test-helpers'

const createLocalVue = () => {
  const newVue = Vue.extend()
  newVue.config = Vue.config
  return newVue
}

describe('Firestore: plugin options', () => {
  it('allows customizing $rtdbBind', () => {
    const LocalVue = createLocalVue()
    LocalVue.use(firestorePlugin, { bindName: '$myBind', unbindName: '$myUnbind' })
    expect(typeof LocalVue.prototype.$myBind).toBe('function')
    expect(typeof LocalVue.prototype.$myUnbind).toBe('function')
  })
  it('allows global use of a custom createSnapshot function', async () => {
    const LocalVue = createLocalVue()
    const pluginOptions = {
      createSnapshot: jest.fn((documentSnapshot) => {
        return {
          customId: documentSnapshot.id,
          globalIsBar: documentSnapshot.data().foo === 'bar',
          stuff: documentSnapshot.data()
        }
      })
    }
    LocalVue.use(firestorePlugin, pluginOptions)

    const items = db.collection()
    const item = items.doc()
    const itemMock = { foo: 'bar' }
    await item.set(itemMock)

    const vm = new LocalVue({
      data: () => ({ items: [] }),
      firestore: { items }
    })
    await delay(5)
    expect(pluginOptions.createSnapshot).toHaveBeenCalledTimes(1)
    expect(Array.isArray(vm.items)).toBe(true)
    expect(vm.items[0]).toEqual({ customId: '0', globalIsBar: true, stuff: itemMock })
  })
})
