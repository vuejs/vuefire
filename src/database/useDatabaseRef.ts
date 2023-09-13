import type { DatabaseReference, Query } from 'firebase/database'
import {
  MaybeRefOrGetter,
  toValue,
  ref,
  shallowRef,
  ShallowRef,
  getCurrentScope,
  Ref,
  isRef,
  watch,
  onScopeDispose,
  getCurrentInstance,
  onServerPrefetch,
} from 'vue-demi'
import { useFirebaseApp } from '../app'
import {
  _Nullable,
  UnbindWithReset,
  checkWrittenTarget,
  useIsSSR,
  noop,
  ResetOption,
} from '../shared'
import { getInitialValue } from '../ssr/initialState'
import { addPendingPromise } from '../ssr/plugin'
import {
  bindAsArray,
  bindAsObject,
  globalDatabaseOptions,
  _DatabaseRefOptions,
} from './bind'
import { _RefDatabase } from './utils'

/**
 * Options when calling `useDatabaseList()` and `useDatabaseObject()`.
 */
export interface UseDatabaseRefOptions extends _DatabaseRefOptions {}

export function _useDatabaseRef(
  reference: MaybeRefOrGetter<_Nullable<DatabaseReference | Query>>,
  localOptions: UseDatabaseRefOptions = {},
  isList = false
): _RefDatabase<unknown> {
  let unbind: UnbindWithReset = noop
  const options = Object.assign({}, globalDatabaseOptions, localOptions)
  const initialSourceValue = toValue(reference)
  const data = options.target || ref<unknown | null>()

  // dev only warning
  if (process.env.NODE_ENV !== 'production') {
    // is the target a ref that has already been passed to useDocument() and therefore can't be extended anymore
    if (
      options.target &&
      checkWrittenTarget(data, 'useDatabaseObject()/useDatabaseList()')
    ) {
      return data as _RefDatabase<unknown>
    }
  }

  // During SSR, we should only get data once
  const isSSR = useIsSSR()
  if (isSSR) {
    options.once = true
  }

  // set the initial value from SSR even if the ref comes from outside
  const initialValue = getInitialValue(
    initialSourceValue,
    options.ssrKey,
    data.value,
    useFirebaseApp()
  )
  data.value = initialValue

  const hasInitialValue = isList
    ? ((initialValue || []) as unknown[]).length > 0
    : initialValue !== undefined

  // if no initial value is found (ssr), we should set pending to true
  let shouldStartAsPending = !hasInitialValue

  const error = ref<Error>()
  const pending = ref(false)
  // force the type since its value is set right after and undefined isn't possible
  const promise = shallowRef() as ShallowRef<Promise<unknown | null>>
  const hasCurrentScope = getCurrentScope()
  let removePendingPromise = noop

  function bindDatabaseRef() {
    const referenceValue = toValue(reference)

    const newPromise = new Promise<unknown | null>((resolve, reject) => {
      unbind(options.reset)
      if (!referenceValue) {
        unbind = noop
        // resolve to avoid an ever pending promise
        return resolve(null)
      }

      pending.value = shouldStartAsPending
      // the very first time we bind, if we hydrated the value, we don't set loading to true
      // this way we ensure, all subsequent calls to bindDatabaseRef will set pending to true
      shouldStartAsPending = true

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
      .catch((reason) => {
        if (promise.value === newPromise) {
          error.value = reason
        }
        throw reason // propagate the error
      })
      .finally(() => {
        // ensure the current promise is still valid
        if (promise.value === newPromise) {
          pending.value = false
        }
      })

    // we set the promise here to ensure that pending is set right after if the user awaits the promise
    promise.value = newPromise
  }

  let stopWatcher = noop
  if (isRef(reference)) {
    stopWatcher = watch(reference, bindDatabaseRef)
  }
  bindDatabaseRef()

  // only add the first promise to the pending ones
  if (initialSourceValue) {
    removePendingPromise = addPendingPromise(
      promise.value,
      initialSourceValue,
      options.ssrKey
    )
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

  // TODO: warn if the data has already any property set (use a symbol to check in dev)

  return Object.defineProperties(data as _RefDatabase<unknown>, {
    // allow destructuring without interfering with the ref itself
    data: { get: () => data },
    error: { get: () => error },
    pending: { get: () => pending },
    promise: { get: () => promise },
    stop: { get: () => stop },
  })
}
