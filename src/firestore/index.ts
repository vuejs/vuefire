import {
  CollectionReference,
  DocumentReference,
  Query,
  getFirestore,
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

export interface UseCollectionOptions extends _UseFirestoreRefOptions {}
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
  R extends CollectionReference<unknown> | Query<unknown>
>(
  collectionRef: MaybeRefOrGetter<_Nullable<R>>,
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
  collectionRef: MaybeRefOrGetter<_Nullable<CollectionReference | Query>>,
  options?: UseCollectionOptions
): _RefFirestore<VueFirestoreQueryData<T>>

export function useCollection<T>(
  collectionRef: MaybeRefOrGetter<
    _Nullable<CollectionReference<unknown> | Query<unknown>>
  >,
  options?: UseCollectionOptions
): _RefFirestore<VueFirestoreQueryData<T>> {
  return _useFirestoreRef(collectionRef, {
    target: ref([]),
    ...options,
  }) as _RefFirestore<VueFirestoreQueryData<T>>
}

export interface UseDocumentOptions extends _UseFirestoreRefOptions {}

/**
 * Creates a reactive document from a document ref from Firestore. Extracts the type of the converter
 *
 * @param documentRef - document reference
 * @param options - optional options
 */
export function useDocument<
  // explicit generic as unknown to allow arbitrary types like numbers or strings
  R extends DocumentReference<unknown>
>(
  documentRef: MaybeRefOrGetter<_Nullable<R>>,
  options?: UseDocumentOptions
): _RefFirestore<_InferReferenceType<R> | undefined> // this one can't be null or should be specified in the converter

/**
 * Creates a reactive collection (usually an array) of documents from a collection ref or a query from Firestore.
 * Accepts a generic to **enforce the type** of the returned Ref. Note you can (and probably should) use
 * `.withConverter()` to have stricter type safe version of a collection reference.
 *
 * @param collectionRef - query or collection
 * @param options - optional options
 */
export function useDocument<T>(
  documentRef: MaybeRefOrGetter<_Nullable<DocumentReference>>,
  options?: UseDocumentOptions
): _RefFirestore<VueFirestoreDocumentData<T> | undefined>

export function useDocument<T>(
  documentRef: MaybeRefOrGetter<_Nullable<DocumentReference<unknown>>>,
  options?: UseDocumentOptions
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
 * @returns the Firestore instance
 */
export function useFirestore(name?: string) {
  return getFirestore(useFirebaseApp(name))
}
