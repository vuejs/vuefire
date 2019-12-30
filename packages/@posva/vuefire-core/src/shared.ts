import { firestore } from 'firebase'

export interface OperationsType {
  set: (target: Record<string, any>, key: string | number, value: any) => any
  add: (array: any[], index: number, data: firebase.firestore.DocumentData) => any
  remove: (array: any[], index: number) => any
}

export type ResetOption = boolean | (() => any)

export type TODO = any
/**
 * Walks a path inside an object
 * walkGet({ a: { b: true }}), 'a.b') -> true
 * @param obj
 * @param path
 */
export function walkGet(obj: Record<string, any>, path: string): any {
  // TODO: development warning when target[key] does not exist
  return path.split('.').reduce((target, key) => target[key], obj)
}

/**
 * Deeply set a property in an object with a string path
 * walkSet({ a: { b: true }}, 'a.b', false)
 * @param obj
 * @param path
 * @param value
 * @returns an array with the element that was replaced or the value that was set
 */
export function walkSet<T>(obj: Record<string, any>, path: string | number, value: T): T | T[] {
  // path can be a number
  const keys = ('' + path).split('.')
  const key = keys.pop() as string // split will produce at least one element array
  const target = keys.reduce(
    (target, key): any =>
      // TODO: dev errors
      target[key],
    obj
  ) as Record<string | number, T> | T[]

  return Array.isArray(target) ? target.splice(Number(key), 1, value) : (target[key] = value)
}

/**
 * Checks if a variable is an object
 * @param o
 */
export function isObject(o: any): o is object {
  return o && typeof o === 'object'
}

/**
 * Checks if a variable is a Date
 * @param o
 */
export function isTimestamp(o: any): o is Date {
  return o.toDate
}

/**
 * Checks if a variable is a Firestore Document Reference
 * @param o
 */
export function isDocumentRef(o: any): o is firestore.DocumentReference {
  return o && o.onSnapshot
}

/**
 * Wraps a function so it gets called only once
 * @param fn Function to be called once
 * @param argFn Function to compute the argument passed to fn
 */
export function callOnceWithArg<T, K>(fn: (arg: T) => K, argFn: () => T): () => K | undefined {
  /** @type {boolean | undefined} */
  let called = false

  return (): K | undefined => {
    if (!called) {
      called = true
      return fn(argFn())
    }
  }
}
