import type { App as AdminApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth, UserRecord } from 'firebase-admin/auth'
import { createServerUser } from 'vuefire/server'
import { getCookie } from 'h3'
import { log } from '../logging'
import { AUTH_COOKIE_NAME, UserSymbol } from '../constants'
import { isFirebaseError } from '../utils'
import { defineNuxtPlugin, useRequestEvent } from '#app'

/**
 * Check if there is a cookie and if it is valid, extracts the user from it. This only requires the admin app.
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const event = useRequestEvent()
  const token = getCookie(event, AUTH_COOKIE_NAME)
  let user: UserRecord | undefined | null
  // ensure the property is set
  event.context.user = null

  // log('debug', `Getting user from "${AUTH_COOKIE_NAME}"`, token)

  if (token) {
    const adminApp = nuxtApp.$firebaseAdminApp as AdminApp
    const adminAuth = getAdminAuth(adminApp)

    try {
      // TODO: should we check for the revoked status of the token here?
      const decodedToken = await adminAuth.verifyIdToken(token)
      user = await adminAuth.getUser(decodedToken.uid)
      event.context.user = user
    } catch (err) {
      // TODO: some errors should probably go higher
      // ignore the error and consider the user as not logged in
      if (isFirebaseError(err) && err.code === 'auth/id-token-expired') {
        // Other errors to be handled: auth/argument-error
        // the error is fine, the user is not logged in
        log('info', 'Token expired -', err)
        // TODO: this error should be accessible somewhere to instruct the user to renew their access token
      } else {
        // ignore the error and consider the user as not logged in
        log('error', 'Unknown Error -', err)
      }
    }
  }

  nuxtApp.payload.vuefireUser = user?.toJSON()

  nuxtApp[
    // we cannot use symbol to index
    UserSymbol as unknown as string
  ] = createServerUser(user)
})

// TODO: should the type extensions be added in a different way to the module?
declare module 'h3' {
  interface H3EventContext {
    /**
     * Firebase Admin User Record. `null` if the user is not logged in or their token is no longer valid and requires a
     * refresh.
     * @experimental This API is experimental and may change in future releases.
     */
    user: UserRecord | null
  }
}
