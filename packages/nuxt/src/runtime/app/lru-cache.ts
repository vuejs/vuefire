import { deleteApp, type FirebaseApp } from 'firebase/app'
import { LRUCache } from '@posva/lru-cache'
import { logger } from '../logging'

// TODO: allow customizing
// TODO: find sensible defaults. Should they change depending on the platform?

// copied from https://github.com/FirebaseExtended/firebase-framework-tools/blob/e69f5bdd44695274ad88dbb4e21aac778ba60cc8/src/constants.ts
export const LRU_MAX_INSTANCES = 100
export const LRU_TTL = 1_000 * 60 * 5
export const appCache = new LRUCache<string, FirebaseApp>({
  max: LRU_MAX_INSTANCES,
  ttl: LRU_TTL,
  allowStale: true,
  // by default the cache deletes the app when getting it and it's stale
  // which creates errors about using a deleted app
  noDeleteOnStaleGet: true,
  updateAgeOnGet: true,
  updateAgeOnHas: true,
  dispose: (firebaseApp) => {
    logger.debug('Deleting Firebase app', firebaseApp.name)
    deleteApp(firebaseApp)
  },
})
