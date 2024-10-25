import { signInWithCustomToken, getAuth, type Auth } from 'firebase/auth'
import {
  type DecodedIdToken,
  getAuth as getAdminAuth,
} from 'firebase-admin/auth'
import type { FirebaseApp } from 'firebase/app'
import type { App as AdminApp } from 'firebase-admin/app'
import { VueFireAuthServer } from 'vuefire/server'
import { DECODED_ID_TOKEN_SYMBOL, UserSymbol } from '../constants'
import { logger } from '../logging'
import { defineNuxtPlugin, useRequestEvent } from '#imports'

/**
 * Setups the auth state based on the cookie.
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const event = useRequestEvent()!
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp
  const firebaseAdminApp = nuxtApp.$firebaseAdminApp as AdminApp
  const adminAuth = getAdminAuth(firebaseAdminApp)
  const auth = nuxtApp.$firebaseAuth as Auth

  const decodedToken = nuxtApp[
    // we cannot use a symbol to index
    DECODED_ID_TOKEN_SYMBOL as unknown as string
  ] as DecodedIdToken | null | undefined

  const uid = decodedToken?.uid

  // this is also undefined if the user hasn't enabled the session cookie option
  if (uid) {
    // reauthenticate if the user is not the same (e.g. invalidated)
    if (auth.currentUser?.uid !== uid) {
      const customToken = await adminAuth
        .createCustomToken(uid)
        .catch((err) => {
          logger.error('Error creating custom token', err)
          return null
        })
      // console.timeLog('token', `got token for ${user.uid}`)
      if (customToken) {
        logger.debug('Signing in with custom token')
        // TODO: allow user to handle error?
        await signInWithCustomToken(auth, customToken)
        // console.timeLog('token', `signed in with token for ${user.uid}`)
        // console.timeEnd('token')
        // TODO: token expiration (1h)
      }
    }

    // inject the current user into the app
    const user = auth.currentUser
    nuxtApp[
      // we cannot use a symbol to index
      UserSymbol as unknown as string
    ] = user
    // expose the user to requests
    // FIXME: should be doable in nitro server routes too
    // use addServerPlugin
    event.context.user = user
    // Hydrates the user
    nuxtApp.payload.vuefireUser = user?.toJSON()
  }

  // logger.debug('setting up user for app', firebaseApp.name, user?.uid)

  // provide the user data to the app during ssr
  VueFireAuthServer(firebaseApp, nuxtApp.vueApp, auth.currentUser)
})
