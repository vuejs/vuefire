import { DatabaseReference, Query as DatabaseQuery } from 'firebase/database'
import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Query as FirestoreQuery,
} from 'firebase/firestore'
import { StorageReference } from 'firebase/storage'
import { getCurrentInstance, inject, ssrContextKey } from 'vue-demi'
import type { Ref, ShallowRef } from 'vue-demi'

export const noop = () => {}

export const isClient = typeof window !== 'undefined'

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
export function walkGet(obj: Record<string, TODO>, path: string): TODO {
  return path.split('.').reduce((target, key) => target && target[key], obj)
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
      target && target[key],
    obj
  )

  if (target == null) return

  return Array.isArray(target)
    ? target.splice(Number(key), 1, value)
    : (target[key] = value)
}

/**
 * Checks if a variable is an object
 * @param o
 */
export function isObject(o: unknown): o is Record<any, unknown> {
  return !!o && typeof o === 'object'
}

const ObjectPrototype = Object.prototype
/**
 *  Check if an object is a plain js object. Differently from `isObject()`, this excludes class instances.
 *
 * @param obj - object to check
 */
export function isPOJO(obj: unknown): obj is Record<any, unknown> {
  return isObject(obj) && Object.getPrototypeOf(obj) === ObjectPrototype
}

/**
 * Checks if a variable is a Firestore Document Reference
 * @param o
 */
export function isDocumentRef<T = DocumentData>(
  o: unknown
): o is DocumentReference<T> {
  return isObject(o) && o.type === 'document'
}

/**
 * Checks if a variable is a Firestore Collection Reference
 * @param o
 */
export function isCollectionRef<T = DocumentData>(
  o: unknown
): o is CollectionReference<T> {
  return isObject(o) && o.type === 'collection'
}

export function isFirestoreDataReference<T = unknown>(
  source: unknown
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
  source: unknown
): source is DatabaseReference | DatabaseQuery {
  return isObject(source) && 'ref' in source
}

export function isStorageReference(
  source: unknown
): source is StorageReference {
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
 *
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
   * nested refs. This is only useful for lists and collections. Objects and documents do not need this.
   */
  wait?: boolean

  /**
   * Should the data be fetched once rather than subscribing to changes.
   * @experimental Still under development
   */
  once?: boolean
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

/**
 * Check if we are in an SSR environment within a composable. Used to force `options.once` to `true`.
 *
 * @internal
 */
export function isSSR(): boolean {
  return !!(getCurrentInstance() && inject(ssrContextKey, null))
}

/**
 * Checks and warns if a data ref has already bee overwritten by useDocument() and others.
 *
 * @internal
 */
export function checkWrittenTarget(
  data: Ref<unknown>,
  fnName: string
): boolean {
  if (Object.getOwnPropertyDescriptor(data, 'data')?.get?.() === data) {
    console.warn(`[VueFire] the passed "options.target" is already the returned value of "${fnName}". If you want to subscribe to a different data source, pass a reactive variable to "${fnName}" instead:
https://vuefire.vuejs.org/guide/realtime-data.html#declarative-realtime-data
This will FAIL in production.`)
    return true
  }

  return false
}
