import type {
  Query,
  DocumentReference,
  CollectionReference,
  FirestoreError,
  DocumentData,
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
} from '../shared'
import { getInitialValue } from '../ssr/initialState'
import { addPendingPromise } from '../ssr/plugin'
import {
  bindCollection,
  bindDocument,
  firestoreOptionsDefaults,
  FirestoreRefOptions,
} from './bind'

export interface _UseFirestoreRefOptions extends FirestoreRefOptions {
  /**
   * @deprecated: use `.withConverter()` instead
   */
  converter?: any
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
  data.value = getInitialValue(initialSourceValue, options.ssrKey, data.value)

  const pending = ref(true)
  const error = ref<FirestoreError>()
  // force the type since its value is set right after and undefined isn't possible
  const promise = shallowRef() as ShallowRef<Promise<unknown | null>>
  const hasCurrentScope = getCurrentScope()
  let removePendingPromise = noop

  function bindFirestoreRef() {
    let docRefValue = unref(docOrCollectionRef)

    const p = new Promise<unknown | null>((resolve, reject) => {
      // stop the previous subscription
      unbind(options.reset)
      // skip if the ref is null or undefined
      // we still want to create the new promise
      if (!docRefValue) {
        unbind = noop
        // resolve to avoid an ever pending promise
        return resolve(null)
      }

      if (!docRefValue.converter) {
        docRefValue = docRefValue.withConverter(
          // @ts-expect-error: seems like a ts error
          options.converter as FirestoreDataConverter<T>
        )
      }

      // FIXME: force once on server
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

    promise.value = p

    p.catch((reason: FirestoreError) => {
      error.value = reason
    }).finally(() => {
      pending.value = false
    })
  }

  let stopWatcher = noop
  if (isRef(docOrCollectionRef)) {
    stopWatcher = watch(docOrCollectionRef, bindFirestoreRef, {
      immediate: true,
    })
  } else {
    bindFirestoreRef()
  }

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
