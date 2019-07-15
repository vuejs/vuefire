import { firestorePlugin } from '../../src'
import { db, Vue } from '@posva/vuefire-test-helpers'
import { firestore } from 'firebase'

Vue.use(firestorePlugin)

describe('Firestore: option merging', () => {
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

  it('should merge properties', () => {
    const { mWithObjA, mWithObjB } = createMixins()
    const vm = new Vue({
      mixins: [mWithObjA, mWithObjB],
    })
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
    const vm = new Vue({
      mixins: [mWithFn],
    })
    expect(vm.$firestoreRefs).toEqual({
      a: db.collection(5),
      c: db.collection(6),
    })
  })

  it('should merge two functions', () => {
    const { mWithFn, mWithObjA, mWithObjB } = createMixins()
    const vm = new Vue({
      mixins: [mWithObjA, mWithObjB, mWithFn],
    })
    expect(vm.$firestoreRefs).toEqual({
      a: db.collection(5),
      b: db.collection(2),
      c: db.collection(6),
    })
  })

  it('ignores no return', () => {
    const spy = (Vue.config.errorHandler = jest.fn())
    // @ts-ignore
    new Vue({
      firestore: () => {},
    })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
