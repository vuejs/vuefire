export {
  bind as rtdbBind,
  unbind as rtdbUnbind,
  useList,
  useObject,
} from './database'

export { databasePlugin } from './database/optionsApi'
export type { DatabasePluginOptions } from './database/optionsApi'

// TODO: rename and move to database
export type { RTDBOptions } from './core'

export {
  bind as firestoreBind,
  unbind as firestoreUnbind,
  useCollection,
  useDocument,
} from './firestore'

export type {
  UseCollectionOptions,
  VueFireDocumentData,
  VueFireQueryData,
} from './firestore'

export { firestorePlugin } from './firestore/optionsApi'
export type {
  FirestorePluginOptions,
  VueFirestoreObject,
  FirestoreOption,
} from './firestore/optionsApi'
