export {
  rtdbPlugin,
  bind as rtdbBind,
  unbind as rtdbUnbind,
  useList,
  useObject,
} from './rtdb'
export {
  firestorePlugin,
  bind as firestoreBind,
  unbind as firestoreUnbind,
  useCollection,
  useDocument,
} from './firestore'

export type { UseCollectionOptions } from './firestore'
