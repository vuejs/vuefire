import test from 'ava'
import Vuefire from '../src'
import {
  db,
  Vue
} from './helpers'

Vue.use(Vuefire)

test.beforeEach(async t => {
  t.context.mWithObjA = {
    firestore: {
      a: db.collection(1),
      b: db.collection(2)
    }
  }

  t.context.mWithObjB = {
    firestore: {
      a: db.collection(3),
      c: db.collection(4)
    }
  }
})

test('should merge properties', t => {
  const { mWithObjA, mWithObjB } = t.context
  const vm = new Vue({
    mixins: [mWithObjA, mWithObjB],
    render: h => h('p', 'foo')
  })
  t.deepEqual(vm.$firestoreRefs, {
    a: db.collection(3),
    b: db.collection(2),
    c: db.collection(4)
  })
})
