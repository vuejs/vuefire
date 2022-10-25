import type {
  CollectionReference,
  DocumentReference,
  Query,
  FirestoreError,
  DocumentData,
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
import {
  isDocumentRef,
  OperationsType,
  walkSet,
  _MaybeRef,
  _RefWithState,
} from '../shared'
import { firestoreUnbinds } from './optionsApi'
import {
  bindCollection,
  bindDocument,
  firestoreOptions,
  FirestoreOptions,
} from './subscribe'

export const ops: OperationsType = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1),
}

type UnbindType = ReturnType<typeof bindCollection | typeof bindDocument>

export interface _UseFirestoreRefOptions extends FirestoreOptions {
  target?: Ref<unknown>
}

/**
 * Internal version of `useDocument()` and `useCollection()`.
 *
 * @internal
 */
export function _useFirestoreRef(
  docOrCollectionRef: _MaybeRef<
    DocumentReference<unknown> | Query<unknown> | CollectionReference<unknown>
  >,
  localOptions?: _UseFirestoreRefOptions
) {
  let _unbind!: UnbindType
  const options = Object.assign({}, firestoreOptions, localOptions)

  // TODO: allow passing pending and error refs as option for when this is called using the options api
  const data = options.target || ref<unknown | null>(options.initialValue)
  const pending = ref(true)
  const error = ref<FirestoreError>()
  // force the type since its value is set right after and undefined isn't possible
  const promise = shallowRef() as ShallowRef<Promise<unknown | null>>
  const createdPromises = new Set<Promise<unknown | null>>()
  const hasCurrentScope = getCurrentScope()

  function bindFirestoreRef() {
    const p = new Promise<unknown | null>((resolve, reject) => {
      let docRefValue = unref(docOrCollectionRef)
      if (!docRefValue.converter) {
        docRefValue = docRefValue.withConverter(
          // @ts-expect-error: seems like a ts error
          options.converter as FirestoreDataConverter<T>
        )
      }

      _unbind = (isDocumentRef(docRefValue) ? bindDocument : bindCollection)(
        data,
        // @ts-expect-error: the type is good because of the ternary
        docRefValue,
        ops,
        resolve,
        reject,
        options
      )
    })

    // only add the first promise to the pending ones
    if (!createdPromises.size) {
      pendingPromises.add(p)
    }
    createdPromises.add(p)
    promise.value = p

    p.catch((reason: FirestoreError) => {
      error.value = reason
    }).finally(() => {
      pending.value = false
    })
  }

  let unwatch: ReturnType<typeof watch> | undefined
  if (isRef(docOrCollectionRef)) {
    unwatch = watch(docOrCollectionRef, bindFirestoreRef, { immediate: true })
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
    onScopeDispose(() => {
      for (const p of createdPromises) {
        pendingPromises.delete(p)
      }
      _unbind(options.reset)
    })
  }

  // TODO: rename to stop
  function unbind() {
    if (unwatch) {
      unwatch()
    }
    _unbind(options.reset)
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

const pendingPromises = new Set<Promise<any>>()

// TODO: should be usable in different contexts, use inject, provide
export function usePendingPromises() {
  return Promise.all(pendingPromises)
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
  collectionRef: R,
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
  collectionRef: CollectionReference | Query,
  options?: UseCollectionOptions
): _RefFirestore<VueFirestoreQueryData<T>>

export function useCollection<T>(
  collectionRef: CollectionReference<unknown> | Query<unknown>,
  options?: UseCollectionOptions
): _RefFirestore<VueFirestoreQueryData<T>> {
  return _useFirestoreRef(collectionRef, options) as _RefFirestore<
    VueFirestoreQueryData<T>
  >
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
  documentRef: _MaybeRef<R>,
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
  documentRef: _MaybeRef<DocumentReference>,
  options?: UseDocumentOptions
): _RefFirestore<VueFirestoreDocumentData<T>>

export function useDocument<T>(
  documentRef: _MaybeRef<DocumentReference<unknown>>,
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
  unbinds:
    | Record<string, ReturnType<typeof bindCollection | typeof bindDocument>>
    | undefined,
  reset?: FirestoreOptions['reset']
) {
  if (unbinds && unbinds[key]) {
    unbinds[key](reset)
    delete unbinds[key]
  }
}

export const unbind = (target: Ref, reset?: FirestoreOptions['reset']) =>
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
