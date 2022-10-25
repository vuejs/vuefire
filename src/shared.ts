import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
} from 'firebase/firestore'
import type { Ref, ShallowRef } from 'vue-demi'

// FIXME: replace any with unknown or T generics

export interface OperationsType {
  set<T extends object = Record<any, unknown>>(
    target: T,
    // accepts a dot delimited path
    path: string | number,
    value: T[any]
  ): T[any] | T[any][]
  add<T extends unknown = unknown>(array: T[], index: number, data: T): T[]
  remove<T extends unknown = unknown>(array: T[], index: number): T[]
}

// TODO: probably boolean | void or just boolean
export type ResetOption = boolean | (() => TODO)

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
export function walkSet<T extends object = Record<any, unknown>>(
  obj: T,
  path: string | number,
  value: T[any]
): T[any] | T[any][] {
  // path can be a number
  const keys = ('' + path).split('.') as Array<keyof T>
  const key = keys.pop() as string // split will produce at least one element array
  const target = keys.reduce(
    (target, key): any =>
      // TODO: dev errors
      target[key],
    obj
  ) as Record<string | number, T> | T[]

  return Array.isArray(target)
    ? target.splice(Number(key), 1, value)
    : (target[key] = value)
}

/**
 * Checks if a variable is an object
 * @param o
 */
export function isObject(o: any): o is Record<any, unknown> {
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
export function isDocumentRef<T = DocumentData>(
  o: any
): o is DocumentReference<T> {
  return isObject(o) && o.type === 'document'
}

/**
 * Checks if a variable is a Firestore Collection Reference
 * @param o
 */
export function isCollectionRef<T = DocumentData>(
  o: any
): o is CollectionReference<T> {
  return isObject(o) && o.type === 'collection'
}

/**
 * Wraps a function so it gets called only once
 * @param fn Function to be called once
 * @param argFn Function to compute the argument passed to fn
 */
export function callOnceWithArg<T, K>(
  fn: (arg: T) => K,
  argFn: () => T
): () => K | undefined {
  let called: boolean | undefined

  return (): K | undefined => {
    if (!called) {
      called = true
      return fn(argFn())
    }
  }
}

/**
 * @internal
 */
export interface _RefWithState<T, E = Error> extends Ref<T> {
  get data(): Ref<T>
  get error(): Ref<E | undefined>
  get pending(): Ref<boolean>

  get promise(): ShallowRef<Promise<void>>
  // TODO: extract type from bindDocument and bindCollection
  unbind: () => void
}

/**
 * @internal
 */
export type _MaybeRef<T> = T | Ref<T>
