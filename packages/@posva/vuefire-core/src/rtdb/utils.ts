import { database } from 'firebase'
import { isObject } from '../shared'

/**
 * Convert firebase RTDB snapshot into a bindable data record.
 *
 * @param snapshot
 * @return
 */
export function createRecordFromRTDBSnapshot(snapshot: database.DataSnapshot): any {
  const value = snapshot.val()
  const res = isObject(value) ? value : Object.defineProperty({}, '.value', { value })
  // if (isObject(value)) {
  //   res = value
  // } else {
  //   res = {}
  //   Object.defineProperty(res, '.value', { value })
  // }

  Object.defineProperty(res, '.key', { value: snapshot.key })
  return res
}

export type RTDBSerializer = typeof createRecordFromRTDBSnapshot

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
