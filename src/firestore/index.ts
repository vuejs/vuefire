import type {
  CollectionReference,
  DocumentReference,
  Query,
  FirestoreError,
  DocumentData,
} from 'firebase/firestore'
import { getCurrentScope, onScopeDispose, ref, Ref } from 'vue-demi'
import {
  isDocumentRef,
  OperationsType,
  walkSet,
  _RefWithState,
} from '../shared'
import { firestoreUnbinds } from './optionsApi'
import { bindCollection, bindDocument, FirestoreOptions } from './subscribe'

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
  docOrCollectionRef:
    | DocumentReference<unknown>
    | Query<unknown>
    | CollectionReference<unknown>,
  options: _UseFirestoreRefOptions = {}
) {
  let unbind!: UnbindType

  // TODO: allow passing pending and error refs as option for when this is called using the options api
  const data = options.target || ref<unknown | null>(options.initialValue)
  const pending = ref(true)
  const error = ref<FirestoreError>()

  const promise = new Promise<unknown | null>((resolve, reject) => {
    unbind = (
      isDocumentRef(docOrCollectionRef) ? bindDocument : bindCollection
    )(
      data,
      // @ts-expect-error: the type is good because of the ternary
      docOrCollectionRef,
      ops,
      resolve,
      reject,
      options
    )
  })

  promise
    .catch((reason: FirestoreError) => {
      error.value = reason
    })
    .finally(() => {
      pending.value = false
    })

  // TODO: SSR serialize the values for Nuxt to expose them later and use them
  // as initial values while specifying a wait: true to only swap objects once
  // Firebase has done its initial sync. Also, on server, you don't need to
  // create sync, you can read only once the whole thing so maybe we
  // should take an option like once: true to not setting up any listener

  // TODO: warn else
  if (getCurrentScope()) {
    pendingPromises.add(promise)
    onScopeDispose(() => {
      pendingPromises.delete(promise)
      unbind()
    })
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
): _RefFirestore<VueFireQueryData<T>>

export function useCollection<T>(
  collectionRef: CollectionReference<unknown> | Query<unknown>,
  options?: UseCollectionOptions
): _RefFirestore<VueFireQueryData<T>> {
  return _useFirestoreRef(collectionRef, options) as _RefFirestore<
    VueFireQueryData<T>
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
  documentRef: R,
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
  documentRef: DocumentReference,
  options?: UseDocumentOptions
): _RefFirestore<VueFireDocumentData<T>>

export function useDocument<T>(
  documentRef: DocumentReference<unknown>,
  options?: UseDocumentOptions
): _RefFirestore<_InferReferenceType<T> | null> | _RefFirestore<T | null> {
  // no unwrapRef to have a simpler type
  return _useFirestoreRef(documentRef, options) as _RefFirestore<T>
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
export type VueFireDocumentData<T = DocumentData> =
  | null
  | (T & {
      /**
       * id of the document
       */
      readonly id: string
    })

export type VueFireQueryData<T = DocumentData> = Array<
  Exclude<VueFireDocumentData<T>, null>
>

export interface _RefFirestore<T> extends _RefWithState<T, FirestoreError> {}
