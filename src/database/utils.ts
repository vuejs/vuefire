import { isObject } from '../shared'
import type { DataSnapshot } from 'firebase/database'
import type { _RefWithState, _Simplify } from '../shared'

/**
 * Convert firebase Database snapshot of a ref **that exists** into a bindable data record.
 *
 * @param snapshot
 * @return
 */
export function createRecordFromDatabaseSnapshot(
  snapshot: DataSnapshot
): VueDatabaseDocumentData<unknown> {
  if (!snapshot.exists()) return null

  const value: unknown = snapshot.val()
  return isObject(value)
    ? (Object.defineProperty(value, 'id', {
        // allow destructuring without interfering without using the `id` property
        value: snapshot.key,
      }) as VueDatabaseDocumentData<unknown>)
    : {
        // if the value is a primitive we can just return a regular object, it's easier to debug
        // @ts-expect-error: $value doesn't exist
        $value: value,
        id: snapshot.key,
      }
}

export interface DatabaseSnapshotSerializer<T = unknown> {
  (snapshot: DataSnapshot): VueDatabaseDocumentData<T>
}

/**
 * Find the index for an object with given key.
 *
 * @param array
 * @param key
 * @return the index where the key was found
 */
export function indexForKey(
  array: NonNullable<VueDatabaseDocumentData>[],
  key: string | null | number
): number {
  for (let i = 0; i < array.length; i++) {
    if (array[i].id === key) return i
  }

  return -1
}

export interface _RefDatabase<T> extends _RefWithState<T, Error> {}

/**
 * Type used by default by the `serialize` option.
 */
export type VueDatabaseDocumentData<T = unknown> =
  | null
  | (T & {
      /**
       * id of the document
       */
      readonly id: string
    })

/**
 * Same as VueDatabaseDocumentData but for a query.
 */
export type VueDatabaseQueryData<T = unknown> = Array<
  _Simplify<NonNullable<VueDatabaseDocumentData<T>>>
>
