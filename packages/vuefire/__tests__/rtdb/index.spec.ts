import { rtdbPlugin } from '../../src'
import { tick, Vue, MockFirebase } from '@posva/vuefire-test-helpers'

Vue.use(rtdbPlugin)

describe('RTDB: firebase option', () => {
  async function createVm() {
    const source = new MockFirebase().child('data')
    const vm = new Vue({
      // purposely set items as null
      // but it's a good practice to set it to an empty array
      data: () => ({
        items: [],
        item: null,
      }),
      firebase: {
        items: source,
        item: source,
      },
    })
    await tick()

    return { vm, source }
  }

  it('does nothing with no firebase', () => {
    const vm = new Vue({
      data: () => ({ items: null }),
    })
    expect(vm.items).toEqual(null)
  })

  it('setups _firebaseUnbinds', async () => {
    const { vm } = await createVm()
    expect(vm._firebaseUnbinds).toBeTruthy()
    expect(Object.keys(vm._firebaseUnbinds).sort()).toEqual(['item', 'items'])
  })

  it('setups _firebaseUnbinds with no firebase options', () => {
    const vm = new Vue({
      data: () => ({ items: null }),
    })
    expect(vm._firebaseUnbinds).toBeTruthy()
    expect(Object.keys(vm._firebaseUnbinds)).toEqual([])
  })

  it('setups $firebaseRefs', async () => {
    const { vm, source } = await createVm()
    expect(Object.keys(vm.$firebaseRefs).sort()).toEqual(['item', 'items'])
    expect(vm.$firebaseRefs.item).toBe(source)
    expect(vm.$firebaseRefs.items).toBe(source)
  })

  it('clears $firebaseRefs on $destroy', async () => {
    const { vm } = await createVm()
    vm.$destroy()
    expect(vm.$firebaseRefs).toEqual(null)
    expect(vm._firebaseUnbinds).toEqual(null)
    expect(vm._firebaseSources).toEqual(null)
  })
})
