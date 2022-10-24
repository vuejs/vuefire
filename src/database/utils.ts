import type { DataSnapshot } from 'firebase/database'
import { isObject } from '../shared'

/**
 * Convert firebase Database snapshot into a bindable data record.
 *
 * @param snapshot
 * @return
 */
export function createRecordFromDatabaseSnapshot(snapshot: DataSnapshot): any {
  const value = snapshot.val()
  const res = isObject(value)
    ? value
    : Object.defineProperty({}, '.value', { value })
  // if (isObject(value)) {
  //   res = value
  // } else {
  //   res = {}
  //   Object.defineProperty(res, '.value', { value })
  // }

  Object.defineProperty(res, '.key', { value: snapshot.key })
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
export function indexForKey(array: any[], key: string | null | number): number {
  for (let i = 0; i < array.length; i++) {
    if (array[i]['.key'] === key) return i
  }

  return -1
}
