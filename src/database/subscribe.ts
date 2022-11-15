import {
  createRecordFromDatabaseSnapshot,
  indexForKey,
  DatabaseSnapshotSerializer,
} from './utils'
import { OperationsType, ResetOption, _DataSourceOptions } from '../shared'
import { ref, Ref, unref } from 'vue-demi'
import type { Query, DatabaseReference } from 'firebase/database'
import {
  onValue,
  onChildAdded,
  onChildChanged,
  onChildMoved,
  onChildRemoved,
} from 'firebase/database'

// TODO: rename to match where it's used
export interface _DatabaseRefOptions extends _DataSourceOptions {
  serialize?: DatabaseSnapshotSerializer
}

export interface _GlobalDatabaseRefOptions extends _DatabaseRefOptions {
  /**
   * @defaultValue `false`
   */
  reset: ResetOption
  /**
   * @defaultValue `true`
   */
  wait: boolean

  serialize: DatabaseSnapshotSerializer
}

const DEFAULT_OPTIONS: _GlobalDatabaseRefOptions = {
  reset: false,
  serialize: createRecordFromDatabaseSnapshot,
  wait: true,
}

// TODO: rename rtdbDefaults databaseDefaults
export { DEFAULT_OPTIONS as rtdbOptions }

interface CommonBindOptionsParameter {
  target: Ref<any>
  resolve: (value: any) => void
  reject: (error: any) => void
  ops: OperationsType
}

// TODO: refactor using normal arguments instead of an array to improve size

interface BindAsObjectParameter extends CommonBindOptionsParameter {
  document: DatabaseReference | Query
}

/**
 * Binds a Firebase Database reference as an object
 * @param param0
 * @param options
 * @returns a function to be called to stop listening for changes
 */
export function bindAsObject(
  { target, document, resolve, reject, ops }: BindAsObjectParameter,
  extraOptions: _DatabaseRefOptions = DEFAULT_OPTIONS
) {
  const key = 'value'
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions)
  const unsub = onValue(
    document,
    (snapshot) => {
      resolve(snapshot)
      unsub()
    },
    reject
  )
  // FIXME: Use only one onValue and
  const listener = onValue(
    document,
    (snapshot) => {
      ops.set(target, key, options.serialize(snapshot))
    }
    // TODO: allow passing a cancel callback
    // cancelCallback
  )

  return (reset?: ResetOption) => {
    listener()
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : null
      ops.set(target, key, value)
    }
  }
}

interface BindAsArrayParameter extends CommonBindOptionsParameter {
  collection: DatabaseReference | Query
}

/**
 * Binds a RTDB reference or query as an array
 * @param param0
 * @param options
 * @returns a function to be called to stop listening for changes
 */
export function bindAsArray(
  { target, collection, resolve, reject, ops }: BindAsArrayParameter,
  extraOptions: _DatabaseRefOptions = DEFAULT_OPTIONS
) {
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions)
  const key = 'value'

  if (!options.wait) ops.set(target, key, [])
  let arrayRef = ref(options.wait ? [] : target[key])

  const removeChildAddedListener = onChildAdded(
    collection,
    (snapshot, prevKey) => {
      const array = unref(arrayRef)
      const index = prevKey ? indexForKey(array, prevKey) + 1 : 0
      ops.add(array, index, options.serialize(snapshot))
    }
    // TODO: cancelcallback
    // reject,
  )

  const removeChildRemovedListener = onChildRemoved(
    collection,

    (snapshot) => {
      const array = unref(arrayRef)
      ops.remove(array, indexForKey(array, snapshot.key))
    }
    // TODO: cancelcallback
  )

  const removeChildChangedListener = onChildChanged(
    collection,
    (snapshot) => {
      const array = unref(arrayRef)
      ops.set(
        array,
        indexForKey(array, snapshot.key),
        options.serialize(snapshot)
      )
    }
    // TODO: cancelcallback
  )

  const removeChildMovedListener = onChildMoved(
    collection,
    (snapshot, prevKey) => {
      const array = unref(arrayRef)
      const index = indexForKey(array, snapshot.key)
      const oldRecord = ops.remove(array, index)[0]
      const newIndex = prevKey ? indexForKey(array, prevKey) + 1 : 0
      ops.add(array, newIndex, oldRecord)
    }
    // TODO: cancelcallback
  )

  // in case the removeValueListener() is called before onValue returns
  let removeValueListener = noop
  removeValueListener = onValue(
    collection,
    (data) => {
      const array = unref(arrayRef)
      if (options.wait) ops.set(target, key, array)
      resolve(data)
      removeValueListener()
    },
    reject
  )

  return (reset?: ResetOption) => {
    removeChildAddedListener()
    removeChildRemovedListener()
    removeChildChangedListener()
    removeChildMovedListener()
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : []
      ops.set(target, key, value)
    }
  }
}
