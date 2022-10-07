import { mount } from '@vue/test-utils'
import { rtdbPlugin } from '../../../src'
import { tick, MockFirebase } from '../../src'

describe('RTDB: firebase option', () => {
  async function createVm() {
    const source = new MockFirebase().child('data')
    const wrapper = mount(
      {
        template: 'no',
        data: () => ({
          items: [],
          item: null,
        }),
        firebase: {
          items: source,
          item: source,
        },
      },
      {
        global: {
          plugins: [rtdbPlugin],
        },
      }
    )
    await tick()

    return { vm: wrapper.vm, source, wrapper }
  }

  it('does nothing with no firebase', () => {
    const wrapper = mount(
      {
        template: 'no',
        data: () => ({ items: null }),
      },
      { global: { plugins: [rtdbPlugin] } }
    )
    expect(wrapper.vm.items).toEqual(null)
  })

  it('does nothing with empty firebase return', () => {
    const wrapper = mount(
      {
        template: 'no',
        data: () => ({ items: null }),
        // @ts-ignore
        firebase: () => {},
      },
      { global: { plugins: [rtdbPlugin] } }
    )
    // @ts-ignore
    expect(wrapper.vm.items).toEqual(null)
  })

  it('setups $firebaseRefs', async () => {
    const { vm, source } = await createVm()
    expect(Object.keys(vm.$firebaseRefs).sort()).toEqual(['item', 'items'])
    expect(vm.$firebaseRefs.item).toBe(source)
    expect(vm.$firebaseRefs.items).toBe(source)
  })

  it('clears $firebaseRefs on $destroy', async () => {
    const { vm, wrapper } = await createVm()
    wrapper.unmount()
    expect(vm.$firebaseRefs).toEqual(null)
  })
})
