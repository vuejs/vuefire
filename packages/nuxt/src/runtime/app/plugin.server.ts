import { deleteApp, type FirebaseApp, initializeApp } from 'firebase/app'
import { type User } from 'firebase/auth'
import { DecodedIdToken } from 'firebase-admin/auth'
import { LRUCache } from 'lru-cache'
import { log } from '../logging'
import { DECODED_ID_TOKEN_SYMBOL } from '../constants'
import { defineNuxtPlugin, useAppConfig } from '#app'

// TODO: allow customizing
// TODO: find sensible defaults. Should they change depending on the platform?
// copied from https://github.com/FirebaseExtended/firebase-framework-tools/blob/e69f5bdd44695274ad88dbb4e21aac778ba60cc8/src/constants.ts
export const LRU_MAX_INSTANCES = 100
export const LRU_TTL = 1_000 * 60 * 5
const appCache = new LRUCache<string, FirebaseApp>({
  max: LRU_MAX_INSTANCES,
  ttl: LRU_TTL,
  allowStale: true,
  updateAgeOnGet: true,
  dispose: (value) => {
    deleteApp(value)
  },
})

/**
 * Initializes the app and provides it to others.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const appConfig = useAppConfig()

  const decodedToken = nuxtApp[
    // we cannot use a symbol to index
    DECODED_ID_TOKEN_SYMBOL as unknown as string
  ] as DecodedIdToken | null | undefined

  const uid = decodedToken?.uid

  let firebaseApp: FirebaseApp | undefined

  // log('debug', 'initializing app with', appConfig.firebaseConfig)
  if (uid) {
    firebaseApp = appCache.get(uid)
    if (!firebaseApp) {
      const randomId = Math.random().toString(36).slice(2)
      // TODO: do we need a randomId?
      const appName = `auth:${uid}:${randomId}`

      log('debug', '👤 creating new app', appName)

      appCache.set(uid, initializeApp(appConfig.firebaseConfig, appName))
      firebaseApp = appCache.get(uid)!
      // console.time('token')
    } else {
      log('debug', '👤 reusing authenticated app', firebaseApp.name)
    }
  } else {
    // TODO: is this safe? should we create a new one everytime
    if (!appCache.has('')) {
      appCache.set('', initializeApp(appConfig.firebaseConfig))
    }
    firebaseApp = appCache.get('')!
    // anonymous session, just create a new app
    log('debug', '🥸 anonymous session')
  }

  return {
    provide: {
      firebaseApp,
    },
  }
})

// TODO: should the type extensions be added in a different way to the module?
declare module 'h3' {
  interface H3EventContext {
    /**
     * Firebase Admin User Record. `null` if the user is not logged in or their token is no longer valid and requires a
     * refresh.
     * @experimental This API is experimental and may change in future releases.
     */
    user: User | null
  }
}
