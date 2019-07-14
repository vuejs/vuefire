import { rtdbPlugin } from '../../src'
import { MockFirebase, Vue } from '@posva/vuefire-test-helpers'

Vue.use(rtdbPlugin)

let mWithObjA, mWithObjB, mWithFn
const db = new MockFirebase().child('data')
db.autoFlush()

const docs = [
  db.child('1'),
  db.child('2'),
  db.child('3'),
  db.child('4'),
  db.child('5'),
  db.child('6'),
]

beforeEach(async () => {
  mWithObjA = {
    data: () => ({ a: null, b: null }),
    firebase: {
      a: docs[0],
      b: docs[1],
    },
  }

  mWithObjB = {
    data: () => ({ a: null, c: null }),
    firebase: {
      // NOTE: probably because of the mock, Vue seems to be trying to merge the
      // objects and it results in a stack overflow but it works on a regular example
      a: docs[2],
      c: docs[3],
    },
  }

  mWithFn = {
    firebase() {
      return {
        a: docs[4],
        c: docs[5],
      }
    },
  }
})

describe('RTDB: merging', () => {
  it.skip('should merge properties', () => {
    const vm = new Vue({
      mixins: [mWithObjA, mWithObjB],
    })
    expect(Object.keys(vm.$firebaseRefs)).toEqual(['a', 'b', 'c'])
    expect(vm.$firebaseRefs).toEqual({
      a: docs[2],
      b: docs[1],
      c: docs[3],
    })
  })

  it('supports function syntax', () => {
    const vm = new Vue({
      mixins: [mWithFn],
    })
    expect(vm.$firebaseRefs).toEqual({
      a: docs[4],
      c: docs[5],
    })
  })

  it.skip('should merge two functions', () => {
    const vm = new Vue({
      mixins: [mWithObjA, mWithObjB, mWithFn],
    })
    expect(vm.$firebaseRefs).toEqual({
      a: docs[4],
      b: docs[1],
      c: docs[5],
    })
  })

  it('ignores no return', () => {
    const spy = (Vue.config.errorHandler = jest.fn())
    new Vue({
      firebase: () => {},
    })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
