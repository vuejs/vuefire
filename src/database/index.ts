import {
  Ref,
  ref,
  getCurrentScope,
  onScopeDispose,
  shallowRef,
  ShallowRef,
  unref,
  watch,
  isRef,
  getCurrentInstance,
  onServerPrefetch,
} from 'vue-demi'
import { DatabaseReference, getDatabase, Query } from 'firebase/database'
import {
  noop,
  OperationsType,
  ResetOption,
  UnbindWithReset,
  walkSet,
  _MaybeRef,
  _Nullable,
  _RefWithState,
} from '../shared'
import { databaseUnbinds } from './optionsApi'
import {
  bindAsArray,
  bindAsObject,
  databaseOptionsDefaults,
  _DatabaseRefOptions,
} from './subscribe'
import {
  VueDatabaseDocumentData,
  VueDatabaseQueryData,
  _RefDatabase,
} from './utils'
import { addPendingPromise } from '../ssr/plugin'
import { useFirebaseApp } from '../app'
import { getInitialValue } from '../ssr/initialState'

export { databasePlugin } from './optionsApi'

// TODO: if we allow passing them locally, we could also add the create and reset to allow creating other data structures like a Map

const ops: OperationsType = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1),
}

export interface UseDatabaseRefOptions extends _DatabaseRefOptions {}

export function _useDatabaseRef(
  reference: _MaybeRef<_Nullable<DatabaseReference | Query>>,
  localOptions: UseDatabaseRefOptions = {}
) {
  let unbind!: UnbindWithReset
  const options = Object.assign({}, databaseOptionsDefaults, localOptions)
  const initialSourceValue = unref(reference)

  const data = options.target || ref<unknown | null>()
  // set the initial value from SSR even if the ref comes from outside
  data.value = getInitialValue(initialSourceValue, options.ssrKey, data.value)

  const error = ref<Error>()
  const pending = ref(true)
  // force the type since its value is set right after and undefined isn't possible
  const promise = shallowRef() as ShallowRef<Promise<unknown | null>>
  const hasCurrentScope = getCurrentScope()
  let removePendingPromise = noop

  function bindDatabaseRef() {
    let referenceValue = unref(reference)

    const p = new Promise<unknown | null>((resolve, reject) => {
      if (!referenceValue) {
        unbind = noop
        // resolve to avoid an ever pending promise
        return resolve(null)
      }

      if (Array.isArray(data.value)) {
        unbind = bindAsArray(
          data as Ref<any>,
          referenceValue,
          resolve,
          reject,
          options
        )
      } else {
        unbind = bindAsObject(data, referenceValue, resolve, reject, options)
      }
    })

    promise.value = p

    p.catch((reason) => {
      error.value = reason
    }).finally(() => {
      pending.value = false
    })

    // TODO: SSR serialize the values for Nuxt to expose them later and use them
    // as initial values while specifying a wait: true to only swap objects once
    // Firebase has done its initial sync. Also, on server, you don't need to
    // create sync, you can read only once the whole thing so maybe _useDatabaseRef
    // should take an option like once: true to not setting up any listener
  }

  let stopWatcher = noop
  if (isRef(reference)) {
    stopWatcher = watch(reference, bindDatabaseRef, { immediate: true })
  } else {
    bindDatabaseRef()
  }

  // only add the first promise to the pending ones
  if (initialSourceValue) {
    removePendingPromise = addPendingPromise(promise.value, initialSourceValue)
  }

  if (hasCurrentScope) {
    onScopeDispose(stop)

    // wait for the promise on SSR
    if (getCurrentInstance()) {
      onServerPrefetch(() => promise.value)
    }
  }

  function stop(reset: ResetOption = options.reset) {
    stopWatcher()
    removePendingPromise()
    unbind(reset)
  }

  return Object.defineProperties(data as _RefDatabase<unknown>, {
    // allow destructuring without interfering with the ref itself
    data: { get: () => data },
    error: { get: () => error },
    pending: { get: () => pending },
    promise: { get: () => promise },
    stop: { get: () => stop },
  })
}

export function internalUnbind(
  key: string,
  unbinds: Record<string, UnbindWithReset> | undefined,
  reset?: ResetOption
) {
  if (unbinds && unbinds[key]) {
    unbinds[key](reset)
    delete unbinds[key]
  }
}

export type UseListOptions = UseDatabaseRefOptions
export type UseObjectOptions = UseDatabaseRefOptions

/**
 * Creates a reactive variable connected to the database.
 *
 * @param reference - Reference or query to the database
 * @param options - optional options
 */
export function useList<T = unknown>(
  reference: _MaybeRef<DatabaseReference | Query>,
  options?: UseListOptions
): _RefDatabase<VueDatabaseQueryData<T>> {
  const data = ref<T[]>([]) as Ref<T[]>
  return _useDatabaseRef(reference, {
    target: data,
    ...options,
  }) as _RefDatabase<VueDatabaseQueryData<T>>
}

export function useObject<T = unknown>(
  reference: _MaybeRef<DatabaseReference>,
  options?: UseObjectOptions
): _RefDatabase<VueDatabaseDocumentData<T> | undefined> {
  const data = ref<T>() as Ref<T | undefined>
  return _useDatabaseRef(reference, {
    target: data,
    ...options,
  }) as _RefDatabase<VueDatabaseDocumentData<T> | undefined>
}

export const unbind = (target: Ref, reset?: ResetOption) =>
  internalUnbind('', databaseUnbinds.get(target), reset)

/**
 * Retrieves the Database instance.
 *
 * @param name - name of the application
 * @returns the Database instance
 */
export function useDatabase(name?: string) {
  return getDatabase(useFirebaseApp(name))
}
