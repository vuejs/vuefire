import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useList, useObject } from '../../src'
import { expectType, tds, setupDatabaseRefs, database } from '../utils'
import { type Ref } from 'vue'
import {
  push,
  ref as _databaseRef,
  remove,
  set,
  update,
} from 'firebase/database'

describe('Database lists', () => {
  const { itemRef, orderedListRef, databaseRef } = setupDatabaseRefs()

  it('binds an object', async () => {
    const wrapper = mount({
      template: 'no',
      setup() {
        const item = useObject(itemRef)

        return { item }
      },
    })

    expect(wrapper.vm.item).toEqual(undefined)

    await set(itemRef, { name: 'a' })
    expect(wrapper.vm.item).toMatchObject({ name: 'a' })
    await update(itemRef, { name: 'b' })
    expect(wrapper.vm.item).toMatchObject({ name: 'b' })
  })

  tds(() => {
    const db = database
    const databaseRef = _databaseRef
    expectType<Ref<unknown[]>>(useList(databaseRef(db, 'todos')))
    expectType<Ref<number[]>>(useList<number>(databaseRef(db, 'todos')))
  })
})
