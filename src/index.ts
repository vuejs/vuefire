import type { FirebaseApp } from 'firebase/app'
import type { App } from 'vue-demi'
import { _FirebaseAppInjectionKey } from './app'

/**
 * Database
 */
export {
  useList,
  useObject,
  useDatabase,
  useDatabaseList,
  useDatabaseObject,
  globalDatabaseOptions,
} from './database'
export type {
  UseListOptions,
  UseObjectOptions,
  UseDatabaseRefOptions,
} from './database'
export type {
  DatabaseSnapshotSerializer,
  _RefDatabase,
  VueDatabaseDocumentData,
  VueDatabaseQueryData,
  createRecordFromDatabaseSnapshot as databaseDefaultSerializer,
} from './database/utils'

/**
 * Firestore
 */
export { useCollection, useDocument, useFirestore } from './firestore'
export { firestoreOptionsDefaults as globalFirestoreOptions } from './firestore/bind'
export { firestoreDefaultConverter } from './firestore/utils'
export type {
  UseCollectionOptions,
  UseDocumentOptions,
  _RefFirestore,
  VueFirestoreDocumentData,
  VueFirestoreQueryData,
} from './firestore'

/**
 * Database Options API
 */
export {
  databasePlugin,
  // To ease migration
  databasePlugin as rtdbPlugin,
  VueFireDatabaseOptionsAPI,
} from './database/optionsApi'
export type {
  DatabasePluginOptions,
  VueFirebaseObject,
  FirebaseOption,
} from './database/optionsApi'

/**
 * Firestore Options API
 */
export {
  firestorePlugin,
  VueFireFirestoreOptionsAPI,
} from './firestore/optionsApi'
export type {
  FirestorePluginOptions,
  VueFirestoreObject,
  FirestoreOption,
} from './firestore/optionsApi'

/**
 * App
 */
export { useFirebaseApp } from './app'

/**
 * Auth
 */
export {
  useCurrentUser,
  useIsCurrentUserLoaded,
  VueFireAuth,
  useFirebaseAuth,
  getCurrentUser,
  updateCurrentUserProfile,
} from './auth'

/**
 * SSR
 */
export { usePendingPromises } from './ssr/plugin'
export { useSSRInitialState } from './ssr/initialState'

/**
 * App Check
 */
export { VueFireAppCheck, useAppCheckToken, useAppCheck } from './app-check'
export type { VueFireAppCheckOptions } from './app-check'

/**
 * Storage
 */
export {
  useFirebaseStorage,
  useStorageFile,
  useStorageFileUrl,
  useStorageFileMetadata,
  // deprecated apis
  useStorage,
  useStorageObject,
  useStorageUrl,
  useStorageMetadata,
} from './storage'

/**
 * Functions
 */
export { useFirebaseFunctions } from './functions'

/**
 * Options for VueFire Vue plugin.
 */
export interface VueFireOptions {
  /**
   * The firebase app used by VueFire and associated with the different modules.
   */
  firebaseApp: FirebaseApp

  /**
   * Array of VueFire modules that should be added to the application. e.g. `[VueFireAuth, VueFireDatabase]`. Remember
   * to import them from `vuefire`.
   */
  modules?: Array<(firebaseApp: FirebaseApp, app: App) => void>
}

/**
 * VueFire Vue plugin.
 */
export function VueFire(
  app: App,
  { firebaseApp, modules = [] }: VueFireOptions
) {
  app.provide(_FirebaseAppInjectionKey, firebaseApp)

  for (const firebaseModule of modules) {
    app.use(firebaseModule.bind(null, firebaseApp))
  }
}
