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
import {
  databasePlugin as _databasePlugin,
  databasePlugin as _rtdbPlugin,
  VueFireDatabaseOptionsAPI as _VueFireDatabaseOptionsAPI,
} from './options-api/database'
import type {
  DatabasePluginOptions as _DatabasePluginOptions,
  VueFirebaseObject as _VueFirebaseObject,
  FirebaseOption as _FirebaseOption,
} from './options-api/database'

export {
  // already deprecated
  databasePlugin,
  // To ease migration
  databasePlugin as rtdbPlugin,
} from './options-api/database'

// TODO: remove deprecations in v4
/**
 * @deprecated import from `vuefire/options-api/database` instead
 */
export const VueFireDatabaseOptionsAPI = _VueFireDatabaseOptionsAPI
/**
 * @deprecated import from `vuefire/options-api/database` instead
 */
export type DatabasePluginOptions = _DatabasePluginOptions
/**
 * @deprecated import from `vuefire/options-api/database` instead
 */
export type VueFirebaseObject = _VueFirebaseObject
/**
 * @deprecated import from `vuefire/options-api/database` instead
 */
export type FirebaseOption = _FirebaseOption

/**
 * Firestore Options API
 */
import { VueFireFirestoreOptionsAPI as _VueFireFirestoreOptionsAPI } from './options-api/firestore'
import type {
  FirestorePluginOptions as _FirestorePluginOptions,
  VueFirestoreObject as _VueFirestoreObject,
  FirestoreOption as _FirestoreOption,
} from './options-api/firestore'

// TODO: remove deprecations in v4
/**
 * @deprecated import from `vuefire/options-api/firestore` instead
 */
export const VueFireFirestoreOptionsAPI = _VueFireFirestoreOptionsAPI
/**
 * @deprecated import from `vuefire/options-api/firestore` instead
 */
export type FirestorePluginOptions = _FirestorePluginOptions
/**
 * @deprecated import from `vuefire/options-api/firestore` instead
 */
export type VueFirestoreObject = _VueFirestoreObject
/**
 * @deprecated import from `vuefire/options-api/firestore` instead
 */
export type FirestoreOption = _FirestoreOption

// this one is deprecated already
export { firestorePlugin } from './options-api/firestore'

/**
 * App
 */
export { useFirebaseApp } from './app'

/**
 * Auth
 */
export {
  useCurrentUser,
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
