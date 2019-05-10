import { createRecordFromRTDBSnapshot, indexForKey } from './utils'

const DEFAULT_OPTIONS = { reset: true }

export function rtdbBindAsObject (
  { vm, key, document, resolve, reject, ops },
  options = DEFAULT_OPTIONS
) {
  options = Object.assign({}, DEFAULT_OPTIONS, options)
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
    if (options.reset !== false) {
      const value = typeof options.reset === 'function' ? options.reset() : null
      ops.set(vm, key, value)
    }
  }
}

export function rtdbBindAsArray (
  { vm, key, collection, resolve, reject, ops },
  options = DEFAULT_OPTIONS
) {
  options = Object.assign({}, DEFAULT_OPTIONS, options)
  const array = []
  ops.set(vm, key, array)

  const childAdded = collection.on(
    'child_added',
    (snapshot, prevKey) => {
      const index = prevKey ? indexForKey(array, prevKey) + 1 : 0
      ops.add(array, index, createRecordFromRTDBSnapshot(snapshot))
    },
    reject
  )

  const childRemoved = collection.on(
    'child_removed',
    snapshot => {
      ops.remove(array, indexForKey(array, snapshot.key))
    },
    reject
  )

  const childChanged = collection.on(
    'child_changed',
    snapshot => {
      ops.set(
        array,
        indexForKey(array, snapshot.key),
        createRecordFromRTDBSnapshot(snapshot)
      )
    },
    reject
  )

  const childMoved = collection.on(
    'child_moved',
    (snapshot, prevKey) => {
      const index = indexForKey(array, snapshot.key)
      const oldRecord = ops.remove(array, index)[0]
      const newIndex = prevKey ? indexForKey(array, prevKey) + 1 : 0
      ops.add(array, newIndex, oldRecord)
    },
    reject
  )

  collection.once('value', resolve)

  return () => {
    collection.off('child_added', childAdded)
    collection.off('child_changed', childChanged)
    collection.off('child_removed', childRemoved)
    collection.off('child_moved', childMoved)
    if (options.reset !== false) {
      const value = typeof options.reset === 'function' ? options.reset() : []
      ops.set(vm, key, value)
    }
  }
}
