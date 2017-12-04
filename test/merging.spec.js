import Vuefire from '../src'
import {
  db,
  Vue
} from './helpers'

Vue.use(Vuefire)

let mWithObjA, mWithObjB
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
})

test('should merge properties', () => {
  const vm = new Vue({
    mixins: [mWithObjA, mWithObjB],
    render: h => h('p', 'foo')
  })
  expect(vm.$firestoreRefs).toEqual({
    a: db.collection(3),
    b: db.collection(2),
    c: db.collection(4)
  })
})

test('TODO: should merge two functions')
