import { FirebaseApp } from 'firebase/app'
import {
  CollectionReference,
  DocumentReference,
  Query as FirestoreQuery,
} from 'firebase/firestore'
import { InjectionKey } from 'vue'
import { useFirebaseApp } from '../app'
import { isFirestoreQuery, _Nullable } from '../shared'

export interface SSRStore {
  // firestore data
  f: Record<string, unknown>
  // rtdb data
  r: Record<string, unknown>

  // storage
  s: Record<string, unknown>

  // auth data
  u: Record<string, unknown>
}

// @internal
const initialStatesMap = new WeakMap<FirebaseApp, SSRStore>()

/**
 * Allows getting the initial state set during SSR on the client.
 *
 * @param initialState - the initial state to set for the firebase app during SSR. Pass undefined to not set it
 * @param firebaseApp - the firebase app to get the initial state for
 * @returns the initial states for the current firebaseApp
 */
export function useSSRInitialState(
  initialState?: SSRStore,
  firebaseApp: FirebaseApp = useFirebaseApp()
): SSRStore {
  // get initial state based on the current firebase app
  if (!initialStatesMap.has(firebaseApp)) {
    initialStatesMap.set(
      firebaseApp,
      initialState || { f: {}, r: {}, s: {}, u: {} }
    )
  }

  return initialStatesMap.get(firebaseApp)!
}

type FirestoreDataSource =
  | DocumentReference<unknown>
  | CollectionReference<unknown>
  | FirestoreQuery<unknown>

export function getInitialValue(
  type: 'f' | 'r',
  ssrKey?: string | undefined,
  dataSource?: _Nullable<FirestoreDataSource>
) {
  const initialState: Record<string, unknown> = useSSRInitialState()[type] || {}
  const key = ssrKey || getFirestoreSourceKey(dataSource)

  // TODO: warn for queries on the client if there are other keys and this is during hydration

  // returns undefined if no key, otherwise initial state or undefined
  // undefined should be treated as no initial state
  return key && initialState[key]
}

export function setInitialValue(
  type: 'f' | 'r',
  value: unknown,
  ssrKey?: string | undefined,
  dataSource?: _Nullable<FirestoreDataSource>
) {
  const initialState: Record<string, unknown> = useSSRInitialState()[type]
  const key = ssrKey || getFirestoreSourceKey(dataSource)

  if (key) {
    initialState[key] = value
  }
}

function getFirestoreSourceKey(
  source: _Nullable<FirestoreDataSource>
): string | undefined {
  return !source || isFirestoreQuery(source) ? undefined : source.path
}
