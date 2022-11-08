import {
  CollectionReference,
  DocumentReference,
  Query,
  FirestoreError,
  DocumentData,
  FirestoreDataConverter,
  getFirestore,
} from 'firebase/firestore'
import {
  getCurrentScope,
  isRef,
  onScopeDispose,
  ref,
  Ref,
  ShallowRef,
  shallowRef,
  unref,
  watch,
} from 'vue-demi'
import { useFirebaseApp } from '../app'
import {
  isDocumentRef,
  noop,
  OperationsType,
  ResetOption,
  UnbindWithReset,
  walkSet,
  _MaybeRef,
  _Nullable,
  _RefWithState,
} from '../shared'
import { addPendingPromise } from '../ssr/plugin'
import { firestoreUnbinds } from './optionsApi'
import {
  bindCollection,
  bindDocument,
  firestoreOptions,
  FirestoreRefOptions,
} from './subscribe'

export const ops: OperationsType = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1),
}

export interface _UseFirestoreRefOptions extends FirestoreRefOptions {
  /**
   * Use the `target` ref instead of creating one.
   */
  target?: Ref<unknown>
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
) {
  let _unbind: UnbindWithReset = noop
  const options = Object.assign({}, firestoreOptions, localOptions)

  // TODO: allow passing pending and error refs as option for when this is called using the options api
  const data = options.target || ref<unknown | null>(options.initialValue)
  const pending = ref(true)
  const error = ref<FirestoreError>()
  // force the type since its value is set right after and undefined isn't possible
  const promise = shallowRef() as ShallowRef<Promise<unknown | null>>
  let isPromiseAdded = false
  const hasCurrentScope = getCurrentScope()
  let removePendingPromise = noop

  function bindFirestoreRef() {
    let docRefValue = unref(docOrCollectionRef)

    const p = new Promise<unknown | null>((resolve, reject) => {
      // stop the previous subscription
      _unbind(options.reset)
      // skip if the ref is null or undefined
      // we still want to create the new promise
      if (!docRefValue) {
        _unbind = noop
        // TODO: maybe we shouldn't resolve this at all?
        return resolve(null)
      }

      if (!docRefValue.converter) {
        docRefValue = docRefValue.withConverter(
          // @ts-expect-error: seems like a ts error
          options.converter as FirestoreDataConverter<T>
        )
      }

      _unbind = (isDocumentRef(docRefValue) ? bindDocument : bindCollection)(
        // @ts-expect-error: cannot type with the ternary
        data,
        docRefValue,
        ops,
        resolve,
        reject,
        options
      )
    })

    // only add the first promise to the pending ones
    if (!isPromiseAdded && docRefValue) {
      // TODO: is there a way to make this only for the first render?
      removePendingPromise = addPendingPromise(p, docRefValue)
      isPromiseAdded = true
    }
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

  // TODO: SSR serialize the values for Nuxt to expose them later and use them
  // as initial values while specifying a wait: true to only swap objects once
  // Firebase has done its initial sync. Also, on server, you don't need to
  // create sync, you can read only once the whole thing so maybe we
  // should take an option like once: true to not setting up any listener

  // TODO: warn else
  if (hasCurrentScope) {
    onScopeDispose(unbind)
  }

  // TODO: rename to stop
  function unbind(reset: ResetOption = options.reset) {
    stopWatcher()
    removePendingPromise()
    _unbind(reset)
  }

  // allow to destructure the returned value
  Object.defineProperties(data, {
    error: {
      get: () => error,
    },
    data: {
      get: () => data,
    },
    pending: {
      get: () => pending,
    },
    promise: {
      get: () => promise,
    },
    unbind: {
      get: () => unbind,
    },
  })

  // no unwrapRef to have a simpler type
  return data as _RefFirestore<unknown>
}

export interface UseCollectionOptions extends _UseFirestoreRefOptions {}

/**
 * Creates a reactive collection (usually an array) of documents from a collection ref or a query from Firestore. Extracts the the type of the
 * query or converter.
 *
 * @param collectionRef - query or collection
 * @param options - optional options
 */
export function useCollection<
  // explicit generic as unknown to allow arbitrary types like numbers or strings
  R extends CollectionReference<unknown> | Query<unknown>
>(
  // TODO: add MaybeRef
  collectionRef: _MaybeRef<_Nullable<R>>,
  options?: UseCollectionOptions
): _RefFirestore<_InferReferenceType<R>[]>

/**
 * Creates a reactive collection (usually an array) of documents from a collection ref or a query from Firestore.
 * Accepts a generic to **enforce the type** of the returned Ref. Note you can (and probably should) use
 * `.withConverter()` to have stricter type safe version of a collection reference.
 *
 * @param collectionRef - query or collection
 * @param options - optional options
 */
export function useCollection<T>(
  collectionRef: _MaybeRef<_Nullable<CollectionReference | Query>>,
  options?: UseCollectionOptions
): _RefFirestore<VueFirestoreQueryData<T>>

export function useCollection<T>(
  collectionRef: _MaybeRef<
    _Nullable<CollectionReference<unknown> | Query<unknown>>
  >,
  options?: UseCollectionOptions
): _RefFirestore<VueFirestoreQueryData<T>> {
  return _useFirestoreRef(collectionRef, {
    target: ref([]),
    ...options,
  }) as _RefFirestore<VueFirestoreQueryData<T>>
}

// TODO: split document and collection into two different parts

export interface UseDocumentOptions extends _UseFirestoreRefOptions {}

/**
 * Creates a reactive document from a document ref from Firestore. Extracts the the type of the converter
 *
 * @param documentRef - document reference
 * @param options - optional options
 */
export function useDocument<
  // explicit generic as unknown to allow arbitrary types like numbers or strings
  R extends DocumentReference<unknown>
>(
  documentRef: _MaybeRef<_Nullable<R>>,
  options?: UseDocumentOptions
): _RefFirestore<_InferReferenceType<R>> // this one can't be null or should be specified in the converter

/**
 * Creates a reactive collection (usually an array) of documents from a collection ref or a query from Firestore.
 * Accepts a generic to **enforce the type** of the returned Ref. Note you can (and probably should) use
 * `.withConverter()` to have stricter type safe version of a collection reference.
 *
 * @param collectionRef - query or collection
 * @param options - optional options
 */
export function useDocument<T>(
  documentRef: _MaybeRef<_Nullable<DocumentReference>>,
  options?: UseDocumentOptions
): _RefFirestore<VueFirestoreDocumentData<T>>

export function useDocument<T>(
  documentRef: _MaybeRef<_Nullable<DocumentReference<unknown>>>,
  options?: UseDocumentOptions
):
  | _RefFirestore<VueFirestoreDocumentData<T> | null>
  | _RefFirestore<VueFirestoreDocumentData<T> | null> {
  // no unwrapRef to have a simpler type
  return _useFirestoreRef(documentRef, options) as _RefFirestore<
    VueFirestoreDocumentData<T>
  >
}

// TODO: move to an unsubscribe file

export function internalUnbind(
  key: string,
  unbinds: Record<string, UnbindWithReset> | undefined,
  reset?: FirestoreRefOptions['reset']
) {
  if (unbinds && unbinds[key]) {
    unbinds[key](reset)
    delete unbinds[key]
  }
}

export const unbind = (target: Ref, reset?: FirestoreRefOptions['reset']) =>
  internalUnbind('', firestoreUnbinds.get(target), reset)

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

export interface _RefFirestore<T> extends _RefWithState<T, FirestoreError> {}

/**
 * Retrieves the Firestore instance.
 *
 * @param name - name of the application
 * @returns the Firestore instance
 */
export function useFirestore(name?: string) {
  return getFirestore(useFirebaseApp(name))
}
