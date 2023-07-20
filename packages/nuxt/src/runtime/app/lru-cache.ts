import { deleteApp, type FirebaseApp } from 'firebase/app'
import { LRUCache } from 'lru-cache'
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
  updateAgeOnGet: true,
  dispose: (value) => {
    logger.debug('Disposing app', value.name)
    deleteApp(value)
  },
})
