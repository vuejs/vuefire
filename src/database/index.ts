import { Ref, ref } from 'vue-demi'
import { DatabaseReference, getDatabase, Query } from 'firebase/database'
import { _MaybeRef, _Nullable, _RefWithState } from '../shared'
import { _DatabaseRefOptions } from './bind'
import {
  VueDatabaseDocumentData,
  VueDatabaseQueryData,
  _RefDatabase,
} from './utils'
import { useFirebaseApp } from '../app'
import { UseDatabaseRefOptions, _useDatabaseRef } from './useDatabaseRef'

export { databasePlugin } from './optionsApi'
export { globalDatabaseOptions } from './bind'
export type { UseDatabaseRefOptions }

export type UseListOptions = UseDatabaseRefOptions

/**
 * Creates a reactive variable connected to the database as an array. Each element in the array will contain an `id`
 * property. Note that if you override the `serialize` option, it should **also set an `id` property** in order for this
 * to work.
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

export type UseObjectOptions = UseDatabaseRefOptions

/**
 * Creates a reactive variable connected to the database as an object. If the reference is a primitive, it will be
 * converted to an object containing a `$value` property with the primitive value and an `id` property with the
 * reference's key.
 *
 * @param reference - Reference or query to the database
 * @param options - optional options
 */
export function useObject<T = unknown>(
  reference: _MaybeRef<DatabaseReference>,
  options?: UseObjectOptions
): _RefDatabase<VueDatabaseDocumentData<T> | undefined> {
  const data = ref<T | null>()
  return _useDatabaseRef(reference, {
    target: data,
    ...options,
  }) as _RefDatabase<VueDatabaseDocumentData<T>>
}

/**
 * Retrieves the Database instance.
 *
 * @param name - name of the application
 * @returns the Database instance
 */
export function useDatabase(name?: string) {
  return getDatabase(useFirebaseApp(name))
}
