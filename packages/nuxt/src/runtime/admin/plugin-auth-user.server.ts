import type { App as AdminApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth, UserRecord } from 'firebase-admin/auth'
import { createServerUser } from 'vuefire/server'
import { getCookie } from 'h3'
// FirebaseError is an interface here but is a class in firebase/app
import type { FirebaseError } from 'firebase-admin'
import { log } from '../logging'
import { AUTH_COOKIE_NAME, UserSymbol } from '../shared'
import { defineNuxtPlugin, useRequestEvent } from '#app'

/**
 * Check if there is a cookie and if it is valid, extracts the user from it. This only requires the admin app.
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const event = useRequestEvent()
  const token = getCookie(event, AUTH_COOKIE_NAME)
  let user: UserRecord | undefined

  log(`Getting user from "${AUTH_COOKIE_NAME}"`, token)

  if (token) {
    const adminApp = nuxtApp.$firebaseAdminApp as AdminApp
    const adminAuth = getAdminAuth(adminApp)

    try {
      // TODO: should we check for the revoked status of the token here?
      const decodedToken = await adminAuth.verifyIdToken(token)
      user = await adminAuth.getUser(decodedToken.uid)
    } catch (err) {
      // TODO: some errors should probably go higher
      // ignore the error and consider the user as not logged in
      if (isFirebaseError(err) && err.code === 'auth/id-token-expired') {
        // Other errors to be handled: auth/argument-error
        // the error is fine, the user is not logged in
        log('Token expired -', err)
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

function isFirebaseError(err: any): err is FirebaseError {
  return err != null && 'code' in err
}
