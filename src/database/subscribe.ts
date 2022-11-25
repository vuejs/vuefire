import {
  createRecordFromDatabaseSnapshot,
  indexForKey,
  DatabaseSnapshotSerializer,
  VueDatabaseQueryData,
} from './utils'
import {
  noop,
  OperationsType,
  ResetOption,
  TODO,
  _DataSourceOptions,
  _MaybeRef,
  _ResolveRejectFn,
} from '../shared'
import { ref, Ref, unref } from 'vue-demi'
import {
  onValue,
  onChildAdded,
  onChildChanged,
  onChildMoved,
  onChildRemoved,
  get,
} from 'firebase/database'
import type { Query, DatabaseReference, DataSnapshot } from 'firebase/database'

/**
 * Global option type when binding one database reference
 * @internal
 */
export interface _DatabaseRefOptions extends _DataSourceOptions {
  /**
   * Function to transform snapshots into data. Make sure to reuse the original serializer to add the object id. See
   * https://vuefire.vuejs.org/guide/global-options.html
   */
  serialize?: DatabaseSnapshotSerializer
}

/**
 * Global defaults type override options for all database bindings.
 * @internal
 */
interface _DatabaseRefOptionsWithDefaults extends _DatabaseRefOptions {
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

const DEFAULT_OPTIONS: _DatabaseRefOptionsWithDefaults = {
  reset: false,
  serialize: createRecordFromDatabaseSnapshot,
  wait: true,
}

export { DEFAULT_OPTIONS as databaseOptionsDefaults }

/**
 * Binds a Firebase Database reference as an object
 * @param param0
 * @param options
 * @returns a function to be called to stop listening for changes
 */
export function bindAsObject(
  target: Ref<unknown>,
  document: DatabaseReference | Query,
  resolve: _ResolveRejectFn,
  reject: _ResolveRejectFn,
  extraOptions?: _DatabaseRefOptions
) {
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions)

  let unsubscribe = noop

  function onValueCallback(snapshot: DataSnapshot) {
    const value = options.serialize(snapshot)
    target.value = value
    // resolve the promise
    resolve(value)
  }

  if (options.once) {
    get(document).then(onValueCallback).catch(reject)
  } else {
    unsubscribe = onValue(document, onValueCallback, reject)
  }

  return (reset?: ResetOption) => {
    unsubscribe()
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : null
      target.value = value
    }
  }
}

/**
 * Binds a RTDB reference or query as an array
 * @param param0
 * @param options
 * @returns a function to be called to stop listening for changes
 */
export function bindAsArray(
  target: Ref<ReturnType<DatabaseSnapshotSerializer>[]>,
  collection: DatabaseReference | Query,
  resolve: _ResolveRejectFn,
  reject: _ResolveRejectFn,
  extraOptions?: _DatabaseRefOptions
) {
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions)

  let arrayRef: _MaybeRef<ReturnType<DatabaseSnapshotSerializer>[]> =
    options.wait ? [] : target
  // by default we wait, if not, set the value to an empty array so it can be populated correctly
  if (!options.wait) {
    target.value = []
  }

  // setup the callbacks to noop for options.once
  let removeChildAddedListener = noop
  let removeChildChangedListener = noop
  let removeChildRemovedListener = noop
  let removeChildMovedListener = noop
  // in case the removeValueListener() is called before onValue returns
  let removeValueListener = noop

  if (options.once) {
    get(collection)
      .then((data) => {
        const array: ReturnType<DatabaseSnapshotSerializer>[] = []
        data.forEach((snapshot) => {
          array.push(options.serialize(snapshot))
        })
        resolve((target.value = array))
      })
      .catch(reject)
  } else {
    removeChildAddedListener = onChildAdded(
      collection,
      (snapshot, prevKey) => {
        const array = unref(arrayRef)
        const index = prevKey ? indexForKey(array, prevKey) + 1 : 0
        array.splice(index, 0, options.serialize(snapshot))
      },
      reject
    )

    removeChildRemovedListener = onChildRemoved(
      collection,

      (snapshot) => {
        const array = unref(arrayRef)
        array.splice(indexForKey(array, snapshot.key), 1)
      },
      reject
    )

    removeChildChangedListener = onChildChanged(
      collection,
      (snapshot) => {
        const array = unref(arrayRef)
        array.splice(
          indexForKey(array, snapshot.key),
          1,
          options.serialize(snapshot)
        )
      },
      reject
    )

    removeChildMovedListener = onChildMoved(
      collection,
      (snapshot, prevKey) => {
        const array = unref(arrayRef)
        const index = indexForKey(array, snapshot.key)
        const oldRecord = array.splice(index, 1)[0]
        const newIndex = prevKey ? indexForKey(array, prevKey) + 1 : 0
        array.splice(newIndex, 0, oldRecord)
      },
      reject
    )

    // we use this to know when the initial data has been loaded
    removeValueListener = onValue(
      collection,
      () => {
        const array = unref(arrayRef)
        if (options.wait) {
          target.value = array
          // switch to the target so all changes happen into the target
          arrayRef = target
        }
        resolve(array)
        removeValueListener()
      },
      reject
    )
  }

  return (reset?: ResetOption) => {
    removeValueListener()
    removeChildAddedListener()
    removeChildRemovedListener()
    removeChildChangedListener()
    removeChildMovedListener()
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : []
      // we trust the user to return an array
      target.value = value as any
    }
  }
}
