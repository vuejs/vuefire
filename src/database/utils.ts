import type { DataSnapshot } from 'firebase/database'
import { isObject, _RefWithState } from '../shared'

/**
 * Convert firebase Database snapshot into a bindable data record.
 *
 * @param snapshot
 * @return
 */
export function createRecordFromDatabaseSnapshot(
  snapshot: DataSnapshot
): VueDatabaseDocumentData<unknown> {
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

export type DatabaseSnapshotSerializer = typeof createRecordFromDatabaseSnapshot

/**
 * Find the index for an object with given key.
 *
 * @param array
 * @param key
 * @return the index where the key was found
 */
export function indexForKey(
  array: VueDatabaseQueryData,
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
  Exclude<VueDatabaseDocumentData<T>, null>
>
