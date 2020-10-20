import { firestorePlugin } from '../../../src'
import { db } from '../../src'
import { firestore } from 'firebase'
import { mount } from '@vue/test-utils'

// FIXME: implement merging strategies
describe.skip('Firestore: option merging', () => {
  function createMixins() {
    // @ts-ignore
    const a1: firestore.CollectionReference = db.collection(1)
    // @ts-ignore
    const b1: firestore.CollectionReference = db.collection(2)
    // @ts-ignore
    const a2: firestore.CollectionReference = db.collection(3)
    // @ts-ignore
    const c2: firestore.CollectionReference = db.collection(4)
    // @ts-ignore
    const a3: firestore.CollectionReference = db.collection(5)
    // @ts-ignore
    const c3: firestore.CollectionReference = db.collection(6)

    const mWithObjA = {
      firestore: {
        a: a1,
        b: b1,
      },
    }

    const mWithObjB = {
      firestore: {
        a: a2,
        c: c2,
      },
    }

    const mWithFn = {
      firestore() {
        return {
          a: a3,
          c: c3,
        }
      },
    }

    return { mWithFn, mWithObjA, mWithObjB }
  }

  function factory(options: any) {
    return mount(
      {
        template: 'no',
        ...options,
      },
      {
        global: {
          plugins: [firestorePlugin],
        },
      }
    )
  }

  it('should merge properties', () => {
    const { mWithObjA, mWithObjB } = createMixins()
    const { vm } = factory({ mixins: [mWithObjA, mWithObjB] })
    expect(vm.$firestoreRefs.a).toBe(mWithObjB.firestore.a)
    expect(vm.$firestoreRefs.b).toBe(mWithObjA.firestore.b)
    expect(vm.$firestoreRefs).toEqual({
      a: db.collection(3),
      b: db.collection(2),
      c: db.collection(4),
    })
  })

  it('supports function syntax', () => {
    const { mWithFn } = createMixins()
    const { vm } = factory({ mixins: [mWithFn] })
    expect(vm.$firestoreRefs).toEqual({
      a: db.collection(5),
      c: db.collection(6),
    })
  })

  it('should merge two functions', () => {
    const { mWithFn, mWithObjA, mWithObjB } = createMixins()
    const { vm } = factory({ mixins: [mWithObjA, mWithObjB, mWithFn] })
    expect(vm.$firestoreRefs).toEqual({
      a: db.collection(5),
      b: db.collection(2),
      c: db.collection(6),
    })
  })
})
