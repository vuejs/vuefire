import Vue from 'vue'
import { MockFirebase, MockedReference } from 'firebase-mock'
import { firestore } from '../../../../node_modules/firebase/index'
import { walkSet } from '@posva/vuefire-core'

Vue.config.productionTip = false
Vue.config.devtools = false
export { Vue, MockFirebase, MockedReference }

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
    fn => {
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
  // @ts-ignore
  ref.onSnapshot = fn =>
    // @ts-ignore
    onSnapshot(async (...args) => {
      await delay(time)
      fn(...args)
    })
}

export function tick() {
  return new Promise(resolve => {
    Vue.nextTick(resolve)
  })
}

export function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time))
}

type WalkSet = typeof walkSet
export const createOps = (walkSet: WalkSet) => ({
  add: jest.fn((array, index, data) => array.splice(index, 0, data)),
  set: jest.fn(walkSet),
  remove: jest.fn((array, index) => array.splice(index, 1)),
})
