import type { FirebaseApp } from 'firebase/app'
import { Query as DatabaseQuery } from 'firebase/database'
import {
  CollectionReference,
  DocumentReference,
  Query as FirestoreQuery,
} from 'firebase/firestore'
import type { App } from 'vue'
import { useFirebaseApp, _FirebaseAppInjectionKey } from '../app'
import { isDatabaseReference, isFirestoreDataReference, noop } from '../shared'

export function VueFireSSR(app: App, firebaseApp: FirebaseApp) {
  app.provide(_FirebaseAppInjectionKey, firebaseApp)
}

const appPendingPromises = new WeakMap<
  FirebaseApp,
  Map<string, Promise<unknown>>
>()

export function addPendingPromise(
  promise: Promise<unknown>,
  // TODO: should this just be ssrKey? and let functions infer the path?
  dataSource:
    | DocumentReference<unknown>
    | FirestoreQuery<unknown>
    | CollectionReference<unknown>
    | DatabaseQuery,
  ssrKey?: string | null | undefined
) {
  const app = useFirebaseApp()
  if (!appPendingPromises.has(app)) {
    appPendingPromises.set(app, new Map())
  }
  const pendingPromises = appPendingPromises.get(app)!

  ssrKey = getDataSourcePath(dataSource)
  if (ssrKey) {
    pendingPromises.set(ssrKey, promise)
  } else {
    // TODO: warn if in SSR context
    // throw new Error('Could not get the path of the data source')
  }

  return ssrKey ? () => pendingPromises.delete(ssrKey!) : noop
}

function getDataSourcePath(
  source:
    | DocumentReference<unknown>
    | FirestoreQuery<unknown>
    | CollectionReference<unknown>
    | DatabaseQuery
): string | null {
  return isFirestoreDataReference(source)
    ? source.path
    : isDatabaseReference(source)
    ? source.toString()
    : null
}

/**
 * Allows awaiting for all pending data sources. Useful to wait for SSR
 *
 * @param name - optional name of teh firebase app
 * @returns - a Promise that resolves with an array of all the resolved pending promises
 */
export function usePendingPromises(name?: string) {
  const app = useFirebaseApp(name)
  const pendingPromises = appPendingPromises.get(app)
  return pendingPromises
    ? Promise.all(
        Array.from(pendingPromises).map(([key, promise]) =>
          promise.then((data) => [key, data] as const)
        )
      )
    : Promise.resolve([])
}

export function getInitialData(
  app?: FirebaseApp
): Promise<Record<string, unknown>> {
  app = app || useFirebaseApp()
  const pendingPromises = appPendingPromises.get(app)

  if (!pendingPromises) {
    if (__DEV__) {
      console.warn('[VueFire]: No initial data found.')
    }
    return Promise.resolve({})
  }

  return usePendingPromises(app.name).then((keyData) =>
    keyData.reduce((initialData, [key, data]) => {
      initialData[key] = data
      return initialData
    }, {} as Record<string, unknown>)
  )
}
