// import { firestore } from '../../../node_modules/firebase/index'

type TODO = any
type EmptyObject = {}

type DocumentData = Record<string, any>

interface OperationsType<T> {
  set: (target: Record<string, any>, key: string, value: T) => T
  add: (array: TODO[], index: number, data: firebase.firestore.DocumentData) => T
  remove: (array: TODO[], index: number) => any
}
