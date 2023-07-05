import type {
  Query,
  DocumentReference,
  CollectionReference,
  FirestoreError,
  DocumentData,
  FirestoreDataConverter,
} from 'firebase/firestore'
import {
  unref,
  ref,
  shallowRef,
  ShallowRef,
  getCurrentScope,
  isRef,
  watch,
  getCurrentInstance,
  onServerPrefetch,
  onScopeDispose,
} from 'vue-demi'
import { useFirebaseApp } from '../app'
import {
  _MaybeRef,
  _Nullable,
  UnbindWithReset,
  noop,
  checkWrittenTarget,
  isSSR,
  isDocumentRef,
  ResetOption,
  OperationsType,
  walkSet,
  _RefWithState,
  isCollectionRef,
} from '../shared'
import { getInitialValue } from '../ssr/initialState'
import { addPendingPromise } from '../ssr/plugin'
import {
  bindCollection,
  bindDocument,
  firestoreOptionsDefaults,
  FirestoreRefOptions,
  _FirestoreRefOptionsWithDefaults,
} from './bind'

export interface _UseFirestoreRefOptions extends FirestoreRefOptions {
  /**
   * @deprecated: use `.withConverter()` instead
   */
  converter?: FirestoreDataConverter<unknown>
}

/**
 * Internal version of `useDocument()` and `useCollection()`.
 *
 * @internal
 */
export function _useFirestoreRef(
  docOrCollectionRef: _MaybeRef<
    _Nullable<
      DocumentReference<unknown> | Query<unknown> | CollectionReference<unknown>
    >
  >,
  localOptions?: _UseFirestoreRefOptions
): _RefFirestore<unknown> {
  let unbind: UnbindWithReset = noop
  const options = Object.assign({}, firestoreOptionsDefaults, localOptions)
  const initialSourceValue = unref(docOrCollectionRef)
  const data = options.target || ref<unknown | null>()

  // dev only warning
  if (process.env.NODE_ENV !== 'production') {
    // is the target a ref that has already been passed to useDocument() and therefore can't be extended anymore
    if (
      options.target &&
      checkWrittenTarget(data, 'useDocument()/useCollection()')
    ) {
      return data as _RefFirestore<unknown>
    }
  }

  if (isSSR()) {
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
  const hasInitialValue =
    // TODO: we need a stricter check for collections and queries and the initial target is passed as a ref([]) but
    // maybe that [] should be set here instead. It's also worth taking into account that a custom ref can be passed as
    // target as it should probably be initially empty but maybe this is too much to ask.
    // TODO: add and test || isFirestoreQuery()
    isCollectionRef(initialSourceValue)
      ? ((initialValue || []) as unknown[]).length > 0
      : initialValue !== undefined

  // if no initial value is found (ssr), we should set pending to true
  let shouldStartAsPending = !hasInitialValue

  const pending = ref(false)
  const error = ref<FirestoreError>()
  // force the type since its value is set right after and undefined isn't possible
  const promise = shallowRef() as ShallowRef<Promise<unknown | null>>
  const hasCurrentScope = getCurrentScope()
  let removePendingPromise = noop

  function bindFirestoreRef() {
    let docRefValue = unref(docOrCollectionRef)

    const newPromise = new Promise<unknown | null>((resolve, reject) => {
      // stop the previous subscription
      unbind(options.reset)
      // skip if the ref is null or undefined
      // we still want to create the new promise
      if (!docRefValue) {
        unbind = noop
        // TODO: should we set pending to false here? probably not since it starts as false
        // resolve to avoid an ever pending promise
        return resolve(null)
      }

      pending.value = shouldStartAsPending
      // the very first time we bind, if we hydrated the value, we don't set loading to true
      // this way we ensure, all subsequent calls to bindDatabaseRef will set pending to true
      shouldStartAsPending = true

      if (!docRefValue.converter) {
        docRefValue = docRefValue.withConverter(
          // @ts-expect-error: seems like a ts error
          options.converter as FirestoreDataConverter<T>
        )
      }

      unbind = (isDocumentRef(docRefValue) ? bindDocument : bindCollection)(
        // @ts-expect-error: cannot type with the ternary
        data,
        docRefValue,
        ops,
        resolve,
        reject,
        options
      )
    })
      .catch((reason) => {
        if (promise.value === newPromise) {
          error.value = reason
        }
        return Promise.reject(reason) // propagate the error
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
  if (isRef(docOrCollectionRef)) {
    stopWatcher = watch(docOrCollectionRef, bindFirestoreRef)
  }

  bindFirestoreRef()

  // only add the first promise to the pending ones
  if (initialSourceValue) {
    removePendingPromise = addPendingPromise(
      promise.value,
      initialSourceValue,
      options.ssrKey
    )
  }
  if (getCurrentInstance()) {
    // wait for the promise during SSR
    // TODO: configurable ssrKey: false to disable this
    onServerPrefetch(() => promise.value)
  }

  if (hasCurrentScope) {
    onScopeDispose(stop)
  }

  function stop(reset: ResetOption = options.reset) {
    stopWatcher()
    removePendingPromise()
    unbind(reset)
  }

  // allow to destructure the returned value
  return Object.defineProperties(data as _RefFirestore<unknown>, {
    error: { get: () => error },
    data: { get: () => data },
    pending: { get: () => pending },
    promise: { get: () => promise },
    stop: { get: () => stop },
  })
}

export const ops: OperationsType = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1),
}

/**
 * Infers the type from a firestore reference. If it is not a reference, it returns the type as is.
 *
 * @internal
 */
export type _InferReferenceType<R> = R extends
  | CollectionReference<infer T>
  | Query<infer T>
  | DocumentReference<infer T>
  ? T
  : R

/**
 * Type used by default by the `firestoreDefaultConverter`.
 */
export type VueFirestoreDocumentData<T = DocumentData> =
  | null
  | (T & {
      /**
       * id of the document
       */
      readonly id: string
    })

export type VueFirestoreQueryData<T = DocumentData> = Array<
  Exclude<VueFirestoreDocumentData<T>, null>
>

/**
 * @internal
 */
export interface _RefFirestore<T> extends _RefWithState<T, FirestoreError> {}
