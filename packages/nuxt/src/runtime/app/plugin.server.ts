import { deleteApp, FirebaseApp, initializeApp } from 'firebase/app'
import { User } from 'firebase/auth'
import LRU from 'lru-cache'
import { UserSymbol } from '../admin/plugin-auth-user.server'
import { defineNuxtPlugin, useAppConfig } from '#app'

// TODO: allow customizing
// TODO: find sensible defaults. Should they change depending on the platform?
// copied from https://github.com/FirebaseExtended/firebase-framework-tools/blob/e69f5bdd44695274ad88dbb4e21aac778ba60cc8/src/constants.ts
export const LRU_MAX_INSTANCES = 100
export const LRU_TTL = 1_000 * 60 * 5
const appCache = new LRU<string, FirebaseApp>({
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

  // @ts-expect-error: this is a private symbol
  const user = nuxtApp[UserSymbol] as User | undefined | null
  const uid = user?.uid

  let firebaseApp: FirebaseApp

  if (uid) {
    if (!appCache.has(uid)) {
      const randomId = Math.random().toString(36).slice(2)
      const appName = `auth:${user.uid}:${randomId}`

      console.log('✅ creating new app', appName)

      appCache.set(uid, initializeApp(appConfig.firebaseConfig, appName))
    }
    firebaseApp = appCache.get(uid)!
  } else {
    // anonymous session, just create a new app
    firebaseApp = initializeApp(appConfig.firebaseConfig)
  }

  return {
    provide: {
      firebaseApp,
    },
  }
})
