export { useList, useObject } from './database'
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
} from './database/utils'

export { databasePlugin } from './database/optionsApi'
export type { DatabasePluginOptions } from './database/optionsApi'

export { useCollection, useDocument } from './firestore'
export type {
  UseCollectionOptions,
  UseDocumentOptions,
  _RefFirestore,
  VueFirestoreDocumentData,
  VueFirestoreQueryData,
} from './firestore'

export { firestorePlugin } from './firestore/optionsApi'
export type {
  FirestorePluginOptions,
  VueFirestoreObject,
  FirestoreOption,
} from './firestore/optionsApi'

export { useFirebaseApp } from './app'
export { usePendingPromises } from './ssr/plugin'
