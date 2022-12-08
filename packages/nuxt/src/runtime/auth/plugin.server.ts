import type { FirebaseApp } from '@firebase/app-types'
import type { App as AdminApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth, UserRecord } from 'firebase-admin/auth'
import { VueFireAuthServer } from 'vuefire/server'
import { getCookie } from 'h3'
// FirebaseError is an interface here but is a class in firebase/app
import type { FirebaseError } from 'firebase-admin'
import { AUTH_COOKIE_NAME } from './api.session'
import { defineNuxtPlugin, useRequestEvent } from '#app'

/**
 * Setups the auth state based on the cookie.
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  const event = useRequestEvent()
  const token = getCookie(event, AUTH_COOKIE_NAME)
  let user: UserRecord | undefined

  if (token) {
    const adminApp = nuxtApp.$adminApp as AdminApp
    const auth = getAdminAuth(adminApp)

    try {
      const decodedToken = await auth.verifyIdToken(token)
      user = await auth.getUser(decodedToken.uid)
    } catch (err) {
      // TODO: some errors should probably go higher
      // ignore the error and consider the user as not logged in
      if (isFirebaseError(err) && err.code === 'auth/id-token-expired') {
        // the error is fine, the user is not logged in
      } else {
        // ignore the error and consider the user as not logged in
        console.error(err)
      }
    }
  }

  nuxtApp.payload.vuefireUser = user?.toJSON()

  // provide the user data to the app during ssr
  VueFireAuthServer(firebaseApp, nuxtApp.vueApp, user)
})

function isFirebaseError(err: any): err is FirebaseError {
  return err != null && 'code' in err
}
