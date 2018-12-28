import { rtdbPlugin } from '../../src'
import { tick, Vue, MockFirebase } from '@posva/vuefire-test-helpers'

Vue.use(rtdbPlugin)

describe('RTDB: firebase option', () => {
  let source, vm
  beforeEach(async () => {
    source = new MockFirebase().child('data')
    vm = new Vue({
      // purposely set items as null
      // but it's a good practice to set it to an empty array
      data: () => ({
        items: [],
        item: null
      }),
      firebase: {
        items: source,
        item: source
      }
    })
    await tick()
  })

  it('does nothing with no firebase', () => {
    const vm = new Vue({
      data: () => ({ items: null })
    })
    expect(vm.items).toEqual(null)
  })

  it('setups _firebaseUnbinds', () => {
    expect(vm._firebaseUnbinds).toBeTruthy()
    expect(Object.keys(vm._firebaseUnbinds).sort()).toEqual(['item', 'items'])
  })

  it('setups _firebaseUnbinds with no firebase options', () => {
    const vm = new Vue({
      data: () => ({ items: null })
    })
    expect(vm._firebaseUnbinds).toBeTruthy()
    expect(Object.keys(vm._firebaseUnbinds)).toEqual([])
  })

  it('setups $firebaseRefs', () => {
    expect(Object.keys(vm.$firebaseRefs).sort()).toEqual(['item', 'items'])
    expect(vm.$firebaseRefs.item).toBe(source)
    expect(vm.$firebaseRefs.items).toBe(source)
  })

  it('clears $firebaseRefs on $destroy', () => {
    vm.$destroy()
    expect(vm.$firebaseRefs).toEqual(null)
    expect(vm._firebaseUnbinds).toEqual(null)
    expect(vm._firebaseSources).toEqual(null)
  })
})
