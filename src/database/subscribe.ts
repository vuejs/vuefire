import {
  createRecordFromRTDBSnapshot,
  indexForKey,
  RTDBSerializer,
} from './utils'
import { OperationsType, ResetOption } from '../shared'
import { ref, Ref, unref } from 'vue-demi'
import type { Query, DatabaseReference } from 'firebase/database'
import {
  onValue,
  off,
  onChildAdded,
  onChildChanged,
  onChildMoved,
  onChildRemoved,
} from 'firebase/database'

// TODO: rename to match where it's used
export interface RTDBOptions {
  reset?: ResetOption
  serialize?: RTDBSerializer
  wait?: boolean

  initialValue?: unknown
}

export interface _GlobalRTDBOptions extends RTDBOptions {
  reset: ResetOption
  serialize: RTDBSerializer
  wait: boolean
}

const DEFAULT_OPTIONS: _GlobalRTDBOptions = {
  reset: true,
  serialize: createRecordFromRTDBSnapshot,
  wait: false,
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
 * Binds a RTDB reference as an object
 * @param param0
 * @param options
 * @returns a function to be called to stop listeninng for changes
 */
export function rtdbBindAsObject(
  { target, document, resolve, reject, ops }: BindAsObjectParameter,
  extraOptions: RTDBOptions = DEFAULT_OPTIONS
) {
  const key = 'value'
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions)
  const listener = onValue(
    document,
    (snapshot) => {
      ops.set(target, key, options.serialize(snapshot))
    }
    // TODO: allow passing a cancel callback
    // cancelCallback
  )
  const unsub = onValue(
    document,
    (snapshot) => {
      resolve(snapshot)
      unsub()
    },
    reject
  )

  return (reset?: ResetOption) => {
    off(document, 'value', listener)
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
export function rtdbBindAsArray(
  { target, collection, resolve, reject, ops }: BindAsArrayParameter,
  extraOptions: RTDBOptions = DEFAULT_OPTIONS
) {
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions)
  const key = 'value'

  if (!options.wait) ops.set(target, key, [])
  let arrayRef = ref(options.wait ? [] : target[key])

  const childAdded = onChildAdded(
    collection,
    (snapshot, prevKey) => {
      const array = unref(arrayRef)
      const index = prevKey ? indexForKey(array, prevKey) + 1 : 0
      ops.add(array, index, options.serialize(snapshot))
    }
    // TODO: cancelcallback
  )

  const childRemoved = onChildRemoved(
    collection,

    (snapshot) => {
      const array = unref(arrayRef)
      ops.remove(array, indexForKey(array, snapshot.key))
    }
    // TODO: cancelcallback
  )

  const childChanged = onChildChanged(
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

  const childMoved = onChildMoved(
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

  const unsub = onValue(
    collection,
    (data) => {
      const array = unref(arrayRef)
      if (options.wait) ops.set(target, key, array)
      resolve(data)
      unsub()
    },
    reject
  )

  return (reset?: ResetOption) => {
    off(collection, 'child_added', childAdded)
    off(collection, 'child_removed', childRemoved)
    off(collection, 'child_changed', childChanged)
    off(collection, 'child_moved', childMoved)
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : []
      ops.set(target, key, value)
    }
  }
}
