import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useCollection } from '../../src'
import { addDoc } from 'firebase/firestore'
import { setupRefs } from '../utils'
import { usePendingPromises } from '../../src/vuefire/firestore'

describe('Firestore collections', () => {
  const { itemRef, listRef, orderedListRef } = setupRefs()

  it('binds a collection as an array', async () => {
    const wrapper = mount(
      {
        template: 'no',
        setup() {
          const list = useCollection(orderedListRef)

          return { list }
        },
      }
      // should work without the plugin
      // { global: { plugins: [firestorePlugin] } }
    )

    expect(wrapper.vm.list).toEqual([])
    await usePendingPromises()

    await addDoc(listRef, { name: 'a' })
    await addDoc(listRef, { name: 'b' })
    await addDoc(listRef, { name: 'c' })
    expect(wrapper.vm.list).toHaveLength(3)
    expect(wrapper.vm.list).toEqual([
      { name: 'a' },
      { name: 'b' },
      { name: 'c' },
    ])
  })
})
