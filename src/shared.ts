import { DatabaseReference, Query as DatabaseQuery } from 'firebase/database'
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Query as FirestoreQuery,
  QuerySnapshot,
  Timestamp,
} from 'firebase/firestore'
import { StorageReference } from 'firebase/storage'
import type { Ref, ShallowRef } from 'vue-demi'

export const noop = () => {}

export const isClient = typeof window !== 'undefined'

// TODO: replace any with unknown or T generics if possible and worth

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

/**
 * Allow resetting a subscription vue ref when the source changes or is removed. `false` keeps the value as is while
 * true resets it to `null` for objects and `[]` for arrays. A function allows to specify a custom reset value.
 */
export type ResetOption = boolean | (() => unknown)

/**
 * Return type of `$databaseBind()` and `$firestoreBind()`
 */
export type UnbindWithReset = (reset?: ResetOption) => void

/**
 * @internal
 */
export type _Nullable<T> = T | null | undefined

export type TODO = any
/**
 * Walks a path inside an object
 * walkGet({ a: { b: true }}), 'a.b') -> true
 * @param obj
 * @param path
 */
export function walkGet(obj: Record<string, any>, path: string): any {
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
  // slipt produces at least one element
  const key = keys.pop()!
  const target: any = keys.reduce(
    (target, key) =>
      // @ts-expect-error:
      target[key],
    obj
  )

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
export function isTimestamp(o: any): o is Timestamp {
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

export function isFirestoreDataReference<T = unknown>(
  source: any
): source is CollectionReference<T> | DocumentReference<T> {
  return isDocumentRef(source) || isCollectionRef(source)
}

export function isFirestoreQuery(
  source: unknown
): source is FirestoreQuery<unknown> & { path: undefined } {
  // makes some types so much easier
  return isObject(source) && source.type === 'query'
}

export function getDataSourcePath(
  source:
    | DocumentReference<unknown>
    | FirestoreQuery<unknown>
    | CollectionReference<unknown>
    | DatabaseQuery
): string | null {
  return isFirestoreDataReference(source)
    ? source.path
    : isDatabaseReference(source)
    ? // gets a path like /users/1?orderByKey=true
      source.toString()
    : isFirestoreQuery(source)
    ? // internal id
      null // FIXME: find a way to get the canonicalId that no longer exists
    : null
}

export function isDatabaseReference(
  source: any
): source is DatabaseReference | DatabaseQuery {
  return isObject(source) && 'ref' in source
}

export function isStorageReference(source: any): source is StorageReference {
  return isObject(source) && typeof source.bucket === 'string'
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

export type _FirestoreDataSource =
  | DocumentReference<unknown>
  | CollectionReference<unknown>
  | FirestoreQuery<unknown>

/**
 * @internal
 */
export interface _RefWithState<T, E = Error> extends Ref<T> {
  /**
   * Realtime data wrapped in a Vue `ref`
   */
  get data(): Ref<T>

  /**
   * Reactive Error if the firebase operation fails
   */
  get error(): Ref<E | undefined>

  /**
   * Reactive loading state
   */
  get pending(): Ref<boolean>

  /**
   * Reactive promise that resolves when the data is loaded or rejects if there is an error
   */
  get promise(): ShallowRef<Promise<T>>

  /**
   * Stops listening to the data changes and stops the Vue watcher.
   */
  stop: (reset?: ResetOption) => void
}

/**
 * @internal
 */
export type _MaybeRef<T> = T | Ref<T>

/**
 * Base options for the data source options in both Firestore and Realtime Database.
 * @internal
 */
export interface _DataSourceOptions {
  /**
   * Use the `target` ref instead of creating one.
   */
  target?: Ref<unknown>

  /**
   * Optional key to handle SSR hydration. **Necessary for Queries** or when the same source is used in multiple places
   * with different converters.
   */
  ssrKey?: string

  /**
   * If true, the data will be reset when the data source is unbound. Pass a function to specify a custom reset value.
   */
  reset?: ResetOption

  /**
   * If true, wait until the data is loaded before setting the data for the first time. For Firestore, this includes
   * nested refs.
   */
  wait?: boolean
}

/**
 * Make all properties in T writable.
 */
export type _Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

/**
 * helper type to get the type of a promise
 *
 * @internal
 */
export interface _ResolveRejectFn {
  (value: unknown): void
}
