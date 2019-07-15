import { rtdbPlugin } from '../../src'
import { MockFirebase, Vue } from '@posva/vuefire-test-helpers'

Vue.use(rtdbPlugin)

function createMixins() {
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

  const mWithObjA = {
    data: () => ({ a: null, b: null }),
    firebase: {
      a: docs[0],
      b: docs[1],
    },
  }

  const mWithObjB = {
    data: () => ({ a: null, c: null }),
    firebase: {
      // NOTE: probably because of the mock, Vue seems to be trying to merge the
      // objects and it results in a stack overflow but it works on a regular example
      a: docs[2],
      c: docs[3],
    },
  }

  const mWithFn = {
    firebase() {
      return {
        a: docs[4],
        c: docs[5],
      }
    },
  }

  return { mWithFn, mWithObjA, mWithObjB, docs }
}

describe('RTDB: merging', () => {
  it.skip('should merge properties', () => {
    const { mWithObjA, mWithObjB, docs } = createMixins()
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
    const { docs, mWithFn } = createMixins()
    const vm = new Vue({
      mixins: [mWithFn],
    })
    expect(vm.$firebaseRefs).toEqual({
      a: docs[4],
      c: docs[5],
    })
  })

  it.skip('should merge two functions', () => {
    const { docs, mWithFn, mWithObjA, mWithObjB } = createMixins()
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
    // @ts-ignore this line is invalid in ts
    new Vue({
      // @ts-ignore this line is invalid in ts
      // firebase: () => {},
    })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
