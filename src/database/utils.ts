import { isObject } from '../shared'
import type { DataSnapshot } from 'firebase/database'
import type { _RefWithState } from '../shared'

/**
 * Convert firebase Database snapshot of a ref **that exists** into a bindable data record.
 *
 * @param snapshot
 * @return
 */
export function createRecordFromDatabaseSnapshot(
  snapshot: DataSnapshot
): NonNullable<VueDatabaseDocumentData<unknown>> {
  const value: unknown = snapshot.val()
  const res: unknown = isObject(value)
    ? value
    : (Object.defineProperty({}, '.value', { value }) as unknown)
  // TODO: Transform the return type to be T directly (value different from object)
  // since we have a ref, we can set any value now

  Object.defineProperty(res, 'id', { value: snapshot.key })
  // @ts-expect-error: id added just above
  return res
}

export interface DatabaseSnapshotSerializer<T = unknown> {
  (snapshot: DataSnapshot): NonNullable<VueDatabaseDocumentData<T>>
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
  NonNullable<VueDatabaseDocumentData<T>>
>
