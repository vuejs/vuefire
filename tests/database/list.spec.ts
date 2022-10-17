import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useList } from '../../src'
import { expectType, tds, setupDatabaseRefs, database } from '../utils'
import { type Ref } from 'vue'
import { push, ref as _databaseRef, remove } from 'firebase/database'

describe('Database lists', () => {
  const { itemRef, listRef, orderedListRef, databaseRef } = setupDatabaseRefs()

  it('binds a list', async () => {
    const wrapper = mount(
      {
        template: 'no',
        setup() {
          const list = useList(orderedListRef)

          return { list }
        },
      }
      // should work without the plugin
      // { global: { plugins: [firestorePlugin] } }
    )

    expect(wrapper.vm.list).toEqual([])

    await push(listRef, { name: 'a' })
    await push(listRef, { name: 'b' })
    await push(listRef, { name: 'c' })
    expect(wrapper.vm.list).toHaveLength(3)
    expect(wrapper.vm.list).toEqual([
      { name: 'a' },
      { name: 'b' },
      { name: 'c' },
    ])
  })

  tds(() => {
    const db = database
    const databaseRef = _databaseRef
    expectType<Ref<unknown[]>>(useList(databaseRef(db, 'todos')))
    expectType<Ref<number[]>>(useList<number>(databaseRef(db, 'todos')))
  })
})
