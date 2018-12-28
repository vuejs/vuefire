import { firestorePlugin } from '../src'
import { db, Vue } from '@posva/vuefire-test-helpers'

Vue.use(firestorePlugin)

describe('Firestore: option merging', () => {
  let mWithObjA, mWithObjB, mWithFn
  beforeEach(async () => {
    mWithObjA = {
      firestore: {
        a: db.collection(1),
        b: db.collection(2)
      }
    }

    mWithObjB = {
      firestore: {
        a: db.collection(3),
        c: db.collection(4)
      }
    }

    mWithFn = {
      firestore () {
        return {
          a: db.collection(5),
          c: db.collection(6)
        }
      }
    }
  })

  it('should merge properties', () => {
    const vm = new Vue({
      mixins: [mWithObjA, mWithObjB]
    })
    expect(vm.$firestoreRefs.a).toBe(mWithObjB.firestore.a)
    expect(vm.$firestoreRefs.b).toBe(mWithObjA.firestore.b)
    expect(vm.$firestoreRefs).toEqual({
      a: db.collection(3),
      b: db.collection(2),
      c: db.collection(4)
    })
  })

  it('supports function syntax', () => {
    const vm = new Vue({
      mixins: [mWithFn]
    })
    expect(vm.$firestoreRefs).toEqual({
      a: db.collection(5),
      c: db.collection(6)
    })
  })

  it('should merge two functions', () => {
    const vm = new Vue({
      mixins: [mWithObjA, mWithObjB, mWithFn]
    })
    expect(vm.$firestoreRefs).toEqual({
      a: db.collection(5),
      b: db.collection(2),
      c: db.collection(6)
    })
  })

  it('ignores no return', () => {
    const spy = (Vue.config.errorHandler = jest.fn())
    new Vue({
      firestore: _ => {}
    })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
