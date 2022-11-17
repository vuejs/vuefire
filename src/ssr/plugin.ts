import type { FirebaseApp } from 'firebase/app'
import { Query as DatabaseQuery } from 'firebase/database'
import {
  CollectionReference,
  DocumentReference,
  Query as FirestoreQuery,
} from 'firebase/firestore'
import { StorageReference } from 'firebase/storage'
import { useFirebaseApp, _FirebaseAppInjectionKey } from '../app'
import { getDataSourcePath, noop } from '../shared'
import { deferInitialValueSetup } from './initialState'

export const appPendingPromises = new WeakMap<
  FirebaseApp,
  Map<string, Promise<unknown>>
>()

export function clearPendingPromises(app: FirebaseApp) {
  appPendingPromises.delete(app)
}

export function addPendingPromise(
  promise: Promise<unknown>,
  dataSource:
    | DocumentReference<unknown>
    | FirestoreQuery<unknown>
    | CollectionReference<unknown>
    | DatabaseQuery
    | StorageReference,
  ssrKey?: string | null | undefined
) {
  const app = useFirebaseApp()
  if (!appPendingPromises.has(app)) {
    appPendingPromises.set(app, new Map())
  }
  const pendingPromises = appPendingPromises.get(app)!

  // TODO: skip this outside of SSR
  const key = deferInitialValueSetup(dataSource, ssrKey, promise)
  if (key) {
    pendingPromises.set(key, promise)
  } else {
    // TODO: warn if in SSR context in other contexts than vite
    if (process.env.NODE_ENV !== 'production' /* && import.meta.env?.SSR */) {
      console.warn('[VueFire]: Could not get the path of the data source')
    }
  }

  return key ? () => pendingPromises.delete(key!) : noop
}

/**
 * Allows awaiting for all pending data sources. Useful to wait for SSR
 *
 * @param name - optional name of teh firebase app
 * @returns - a Promise that resolves with an array of all the resolved pending promises
 */
export function usePendingPromises(app?: FirebaseApp) {
  app = app || useFirebaseApp()
  const pendingPromises = appPendingPromises.get(app)
  const p = pendingPromises
    ? Promise.all(
        Array.from(pendingPromises).map(([key, promise]) =>
          promise.then((data) => [key, data] as const)
        )
      )
    : Promise.resolve([])

  // consume the promises
  appPendingPromises.delete(app)

  return p
}

export function getInitialData(
  app?: FirebaseApp
): Promise<Record<string, unknown>> {
  app = app || useFirebaseApp()
  const pendingPromises = appPendingPromises.get(app)

  if (!pendingPromises) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[VueFire]: No initial data found.')
    }
    return Promise.resolve({})
  }

  return usePendingPromises(app).then((keyData) =>
    keyData.reduce((initialData, [key, data]) => {
      initialData[key] = data
      return initialData
    }, {} as Record<string, unknown>)
  )
}
