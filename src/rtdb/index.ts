import * as database from '@firebase/database-types'
import {
  createRecordFromRTDBSnapshot,
  indexForKey,
  RTDBSerializer,
} from './utils'
import { OperationsType, ResetOption } from '../shared'
import { ref, Ref, unref } from 'vue-demi'

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
  target: Ref<any>
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
  { target, document, resolve, reject, ops }: BindAsObjectParameter,
  extraOptions: RTDBOptions = DEFAULT_OPTIONS
) {
  const key = 'value'
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions)
  const listener = document.on(
    'value',
    (snapshot) => {
      ops.set(target, key, options.serialize(snapshot))
    }
    // TODO: allow passing a cancel callback
    // cancelCallback
  )
  document.once('value', resolve, reject)

  return (reset?: ResetOption) => {
    document.off('value', listener)
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : null
      ops.set(target, key, value)
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
  { target, collection, resolve, reject, ops }: BindAsArrayParameter,
  extraOptions: RTDBOptions = DEFAULT_OPTIONS
) {
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions)
  const key = 'value'

  if (!options.wait) ops.set(target, key, [])
  let arrayRef = ref(options.wait ? [] : target[key])

  const childAdded = collection.on(
    'child_added',
    (snapshot, prevKey) => {
      const array = unref(arrayRef)
      const index = prevKey ? indexForKey(array, prevKey) + 1 : 0
      ops.add(array, index, options.serialize(snapshot))
    }
    // TODO: cancelcallback
  )

  const childRemoved = collection.on(
    'child_removed',
    (snapshot) => {
      const array = unref(arrayRef)
      ops.remove(array, indexForKey(array, snapshot.key))
    }
    // TODO: cancelcallback
  )

  const childChanged = collection.on(
    'child_changed',
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

  const childMoved = collection.on(
    'child_moved',
    (snapshot, prevKey) => {
      const array = unref(arrayRef)
      const index = indexForKey(array, snapshot.key)
      const oldRecord = ops.remove(array, index)[0]
      const newIndex = prevKey ? indexForKey(array, prevKey) + 1 : 0
      ops.add(array, newIndex, oldRecord)
    }
    // TODO: cancelcallback
  )

  collection.once(
    'value',
    (data) => {
      const array = unref(arrayRef)
      if (options.wait) ops.set(target, key, array)
      resolve(data)
    },
    reject
  )

  return (reset?: ResetOption) => {
    collection.off('child_added', childAdded)
    collection.off('child_changed', childChanged)
    collection.off('child_removed', childRemoved)
    collection.off('child_moved', childMoved)
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : []
      ops.set(target, key, value)
    }
  }
}
