import { nextTick } from 'vue-demi'
import { MockFirebase, MockedReference } from 'firebase-mock'
import * as firestore from '@firebase/firestore-types'
import { walkSet } from '../../src/core'

// Vue.config.productionTip = false
// Vue.config.devtools = false
export { MockFirebase, MockedReference }

export * from './mock'

type FirestoreReference =
  | firestore.CollectionReference
  | firestore.DocumentReference
  | firestore.Query

export function spyUnbind(ref: FirestoreReference) {
  const unbindSpy = jest.fn()
  const onSnapshot = ref.onSnapshot.bind(ref)
  ref.onSnapshot =
    // @ts-ignore
    (fn) => {
      // @ts-ignore
      const unbind = onSnapshot(fn)
      return () => {
        unbindSpy()
        unbind()
      }
    }
  return unbindSpy
}

export function spyOnSnapshot(ref: FirestoreReference) {
  const onSnapshot = ref.onSnapshot.bind(ref)
  // @ts-ignore
  return (ref.onSnapshot = jest.fn((...args) => onSnapshot(...args)))
}

export function spyOnSnapshotCallback(ref: FirestoreReference) {
  const onSnapshot = ref.onSnapshot.bind(ref)
  const spy = jest.fn()
  ref.onSnapshot = (fn: any) =>
    // @ts-ignore
    onSnapshot((...args) => {
      spy()
      fn(...args)
    })
  return spy
}

// This makes sure some tests fail by delaying callbacks
export function delayUpdate(ref: firestore.DocumentReference, time = 0) {
  const onSnapshot = ref.onSnapshot.bind(ref)
  ref.onSnapshot = (fn) =>
    onSnapshot(async (...args) => {
      await delay(time)
      if (typeof fn !== 'function') {
        throw new Error('onSnapshot can only be called on function')
      }
      fn(...args)
    })
}

export const tick = nextTick

export function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

type WalkSet = typeof walkSet
export const createOps = (localWalkSet: WalkSet = walkSet) => ({
  add: jest.fn((array, index, data) => array.splice(index, 0, data)),
  set: jest.fn(localWalkSet),
  remove: jest.fn((array, index) => array.splice(index, 1)),
})
