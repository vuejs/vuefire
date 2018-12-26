import { createRecordFromRTDBSnapshot, indexForKey } from './utils'

export function rtdbBindAsObject ({ vm, key, document, resolve, reject, ops }) {
  const listener = document.on(
    'value',
    snapshot => {
      ops.set(vm, key, createRecordFromRTDBSnapshot(snapshot))
    },
    reject
  )
  document.once('value', resolve)

  return () => {
    document.off('value', listener)
  }
}

export function rtdbBindAsArray ({ vm, key, collection, resolve, reject, ops }) {
  const array = []
  ops.set(vm, key, array)

  collection.on(
    'child_added',
    (snapshot, prevKey) => {
      const index = prevKey ? indexForKey(array, prevKey) + 1 : 0
      ops.add(array, index, createRecordFromRTDBSnapshot(snapshot))
    },
    reject
  )

  collection.once('value', resolve)
}
