import { firestorePlugin } from '../../../src'
import { db, tick } from '../../src'
import { firestore } from 'firebase'
import { ComponentPublicInstance } from 'vue'
import { mount, VueWrapper } from '@vue/test-utils'

describe('Firestore: firestore option', () => {
  let collection: firestore.CollectionReference
  let document: firestore.DocumentReference
  let vm: ComponentPublicInstance & { items: any[]; item: any }
  let wrapper: VueWrapper<ComponentPublicInstance & { items: any[]; item: any }>
  beforeEach(async () => {
    // @ts-ignore
    collection = db.collection()
    document = collection.doc()
    wrapper = mount(
      {
        template: 'no',
        // purposely set items as null
        // but it's a good practice to set it to an empty array
        data: () => ({
          items: null,
          item: null,
        }),
        firestore: {
          items: collection,
          item: document,
        },
      },
      { global: { plugins: [firestorePlugin] } }
    )
    await tick()
    vm = wrapper.vm
  })

  it('does nothing with no firestore', () => {
    const wrapper = mount({
      template: 'no',
      data: () => ({ items: null }),
    })
    expect(wrapper.vm.items).toEqual(null)
  })

  it('ignores no return', () => {
    const spy = jest.fn()
    mount(
      {
        template: 'no',
        // @ts-ignore: only care about not crashing
        firestore: () => {},
        data: () => ({ items: null }),
      },
      {
        global: {
          config: {
            errorHandler: spy,
          },
        },
      }
    )
    expect(spy).not.toHaveBeenCalled()
  })

  it('setups $firestoreRefs', () => {
    expect(Object.keys(vm.$firestoreRefs).sort()).toEqual(['item', 'items'])
    expect(vm.$firestoreRefs.item).toBe(document)
    expect(vm.$firestoreRefs.items).toBe(collection)
  })

  it('clears $firestoreRefs on $destroy', () => {
    wrapper.unmount()
    expect(vm.$firestoreRefs).toEqual(null)
  })
})
