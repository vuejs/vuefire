import { deleteApp, type FirebaseApp, initializeApp } from 'firebase/app'
import { getAuth, signInWithCustomToken, type User } from 'firebase/auth'
import { type App as AdminApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import { LRUCache } from 'lru-cache'
import { log } from '../logging'
import { UserSymbol } from '../constants'
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
export default defineNuxtPlugin(async (nuxtApp) => {
  const appConfig = useAppConfig()

  const user = nuxtApp[
    // we cannot use a symbol to index
    UserSymbol as unknown as string
  ] as User | undefined | null
  const uid = user?.uid

  let firebaseApp: FirebaseApp | undefined

  // log('debug', 'initializing app with', appConfig.firebaseConfig)
  if (uid) {
    firebaseApp = appCache.get(uid)
    if (!firebaseApp) {
      const randomId = Math.random().toString(36).slice(2)
      // TODO: do we need a randomId?
      const appName = `auth:${user.uid}:${randomId}`

      // log('log', '👤 creating new app', appName)

      appCache.set(uid, initializeApp(appConfig.firebaseConfig, appName))
      firebaseApp = appCache.get(uid)!
      const firebaseAdminApp = nuxtApp.$firebaseAdminApp as AdminApp
      const adminAuth = getAdminAuth(firebaseAdminApp)
      // console.time('token')
      const customToken = await adminAuth.createCustomToken(user.uid)
      // console.timeLog('token', `got token for ${user.uid}`)
      const credentials = await signInWithCustomToken(
        getAuth(firebaseApp),
        customToken
      )
      // console.timeLog('token', `signed in with token for ${user.uid}`)
      // console.timeEnd('token')
      // TODO: token expiration (1h)
    }
  } else {
    // anonymous session, just create a new app
    // log('log', '🥸 anonymous session')
    firebaseApp = initializeApp(appConfig.firebaseConfig)
  }

  return {
    provide: {
      firebaseApp,
    },
  }
})
