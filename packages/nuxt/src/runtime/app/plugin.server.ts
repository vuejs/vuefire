import { type FirebaseApp, initializeApp } from 'firebase/app'
import { type User } from 'firebase/auth'
import { type DecodedIdToken } from 'firebase-admin/auth'
import { logger } from '../logging'
import { DECODED_ID_TOKEN_SYMBOL } from '../constants'
import { appCache } from './lru-cache'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

/**
 * Initializes the app and provides it to others.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()

  const decodedToken = nuxtApp[
    // we cannot use a symbol to index
    DECODED_ID_TOKEN_SYMBOL as unknown as string
  ] as DecodedIdToken | null | undefined

  const uid = decodedToken?.uid

  let firebaseApp: FirebaseApp | undefined

  // logger.debug('initializing app with', runtimeConfig.public.vuefire!.config!)
  if (uid) {
    firebaseApp = appCache.get(uid)
    if (!firebaseApp) {
      const randomId = Math.random().toString(36).slice(2)
      // TODO: do we need a randomId?
      const appName = `auth:${uid}:${randomId}`

      logger.debug('👤 creating new app', appName)

      firebaseApp = initializeApp(
        runtimeConfig.public.vuefire!.config!,
        appName
      )
      appCache.set(uid, firebaseApp)
      // console.time('token')
    } else {
      logger.debug('👤 reusing authenticated app', firebaseApp.name)
    }
  } else {
    firebaseApp = appCache.get('')
    // TODO: is this safe? should we create a new one every time
    if (!firebaseApp) {
      firebaseApp = initializeApp(runtimeConfig.public.vuefire!.config!)
      appCache.set('', firebaseApp)
    }
    // anonymous session, just create a new app
    logger.debug('🥸 anonymous session')
  }

  return {
    provide: {
      firebaseApp: firebaseApp satisfies FirebaseApp,
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
