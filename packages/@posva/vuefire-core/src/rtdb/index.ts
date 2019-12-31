import { database } from 'firebase'
import { createRecordFromRTDBSnapshot, indexForKey, RTDBSerializer } from './utils'
import { OperationsType, ResetOption } from '../shared'

export interface RTDBOptions {
  reset?: ResetOption
  serialize?: RTDBSerializer
  wait?: boolean
}

const DEFAULT_OPTIONS: Required<RTDBOptions> = {
  reset: true,
  serialize: createRecordFromRTDBSnapshot,
  wait: false,
}

export { DEFAULT_OPTIONS as rtdbOptions }

interface CommonBindOptionsParameter {
  vm: object
  key: string
  resolve: (value: any) => void
  reject: (error: any) => void
  ops: OperationsType
}

// TODO: refactor using normal arguments instead of an array to improve size

interface BindAsObjectParameter extends CommonBindOptionsParameter {
  document: database.Reference | database.Query
}

/**
 * Binds a RTDB reference as an object
 * @param param0
 * @param options
 * @returns a function to be called to stop listeninng for changes
 */
export function rtdbBindAsObject(
  { vm, key, document, resolve, reject, ops }: BindAsObjectParameter,
  extraOptions: RTDBOptions = DEFAULT_OPTIONS
) {
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions)
  const listener = document.on(
    'value',
    snapshot => {
      ops.set(vm, key, options.serialize(snapshot))
    },
    reject
  )
  document.once('value', resolve)

  return (reset?: ResetOption) => {
    document.off('value', listener)
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : null
      ops.set(vm, key, value)
    }
  }
}

interface BindAsArrayParameter extends CommonBindOptionsParameter {
  collection: database.Reference | database.Query
}

/**
 * Binds a RTDB reference or query as an array
 * @param param0
 * @param options
 * @returns a function to be called to stop listeninng for changes
 */
export function rtdbBindAsArray(
  { vm, key, collection, resolve, reject, ops }: BindAsArrayParameter,
  extraOptions: RTDBOptions = DEFAULT_OPTIONS
) {
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions)

  const array: any[] = options.wait ? [] : ops.set(vm, key, [])

  const childAdded = collection.on(
    'child_added',
    (snapshot, prevKey) => {
      const index = prevKey ? indexForKey(array, prevKey) + 1 : 0
      ops.add(array, index, options.serialize(snapshot))
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
      ops.set(array, indexForKey(array, snapshot.key), options.serialize(snapshot))
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

  collection.once('value', data => {
    if (options.wait) ops.set(vm, key, array)
    resolve(data)
  })

  return (reset?: ResetOption) => {
    collection.off('child_added', childAdded)
    collection.off('child_changed', childChanged)
    collection.off('child_removed', childRemoved)
    collection.off('child_moved', childMoved)
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : []
      ops.set(vm, key, value)
    }
  }
}
