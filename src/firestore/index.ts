import {
  CollectionReference,
  DocumentReference,
  Query,
  getFirestore,
  type Firestore,
} from 'firebase/firestore'
import { ref, MaybeRefOrGetter } from 'vue-demi'
import { useFirebaseApp } from '../app'
import type { _Nullable, _RefWithState } from '../shared'
import {
  VueFirestoreDocumentData,
  VueFirestoreQueryData,
  _InferReferenceType,
  _RefFirestore,
  _useFirestoreRef,
  _UseFirestoreRefOptions,
} from './useFirestoreRef'

export interface UseCollectionOptions<TData = unknown>
  extends _UseFirestoreRefOptions<TData> {}
export type { _RefFirestore, VueFirestoreDocumentData, VueFirestoreQueryData }

/**
 * Creates a reactive collection (usually an array) of documents from a collection ref or a query from Firestore. Extracts the type of the
 * query or converter.
 *
 * @param collectionRef - query or collection
 * @param options - optional options
 */
export function useCollection<
  // explicit generic as unknown to allow arbitrary types like numbers or strings
  R extends CollectionReference<unknown> | Query<unknown>,
>(
  collectionRef: MaybeRefOrGetter<_Nullable<R>>,
  options?: UseCollectionOptions<_InferReferenceType<R>[]>
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
  collectionRef: MaybeRefOrGetter<
    _Nullable<CollectionReference<unknown> | Query<unknown>>
  >,
  options?: UseCollectionOptions<T[]>
): _RefFirestore<VueFirestoreQueryData<T>>

export function useCollection<T>(
  collectionRef: MaybeRefOrGetter<
    _Nullable<CollectionReference<unknown> | Query<unknown>>
  >,
  options?: UseCollectionOptions<T[]>
): _RefFirestore<VueFirestoreQueryData<T>> {
  return _useFirestoreRef(collectionRef, {
    target: ref([]),
    ...options,
  }) as _RefFirestore<VueFirestoreQueryData<T>>
}

export interface UseDocumentOptions<TData = unknown>
  extends _UseFirestoreRefOptions<TData> {}

/**
 * Creates a reactive document from a document ref from Firestore. Automatically extracts the type of the converter or
 * the document.
 *
 * @param documentRef - document reference
 * @param options - optional options
 */
export function useDocument<
  // explicit generic as unknown to allow arbitrary types like numbers or strings
  R extends DocumentReference<unknown>,
>(
  documentRef: MaybeRefOrGetter<_Nullable<R>>,
  options?: UseDocumentOptions<_InferReferenceType<R>>
): _RefFirestore<_InferReferenceType<R> | undefined> // this one can't be null or should be specified in the converter

/**
 * Creates a reactive collection (usually an array) of documents from a collection ref or a query from Firestore.
 * Accepts a generic to **enforce the type** of the returned Ref. Note you can (and probably should) use
 * `.withConverter()` to have stricter type safe version of a collection reference.
 *
 * @param documentRef - query or collection
 * @param options - optional options
 */
export function useDocument<T>(
  documentRef: MaybeRefOrGetter<_Nullable<DocumentReference>>,
  options?: UseDocumentOptions<T>
): _RefFirestore<VueFirestoreDocumentData<T> | undefined>

export function useDocument<T>(
  documentRef: MaybeRefOrGetter<_Nullable<DocumentReference<unknown>>>,
  options?: UseDocumentOptions<T>
): _RefFirestore<VueFirestoreDocumentData<T> | undefined> {
  // no unwrapRef to have a simpler type
  return _useFirestoreRef(documentRef, options) as _RefFirestore<
    VueFirestoreDocumentData<T>
  >
}

/**
 * Retrieves the Firestore instance.
 *
 * @param name - name of the application
 * @param database - name of the database
 * @returns the Firestore instance
 */
export function useFirestore(database: string): Firestore
export function useFirestore(options: {
  name?: string
  database?: string
}): Firestore
export function useFirestore(
  optionsOrDatabase: string | { name?: string; database?: string }
): Firestore {
  if (typeof optionsOrDatabase === 'string') {
    return getFirestore(useFirebaseApp(), optionsOrDatabase)
  }

  if (optionsOrDatabase.database) {
    return getFirestore(
      useFirebaseApp(optionsOrDatabase.name),
      optionsOrDatabase.database
    )
  }

  return getFirestore(useFirebaseApp(optionsOrDatabase.name))
}
