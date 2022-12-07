import type { FirebaseApp } from '@firebase/app-types'
import type { App as AdminApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import { getAuth, onIdTokenChanged, signInWithCredential, AuthCredential } from 'firebase/auth'
import { getCurrentUser, VueFireAuth } from 'vuefire'
import { getCookie } from 'h3'
import { AUTH_COOKIE_NAME } from '../../auth/session'
import { defineNuxtPlugin, useRequestEvent } from '#app'

/**
 * Setups VueFireAuth and automatically mints a cookie based auth session. On the server, it reads the cookie to
 * generate the proper auth state.
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  if (process.server) {
    const event = useRequestEvent()
    const token = getCookie(event, AUTH_COOKIE_NAME)

    if (token) {
      const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp
      const adminApp = nuxtApp.$adminApp as AdminApp
      const auth = getAdminAuth(adminApp)

      const decodedToken = await auth.verifyIdToken(token)
      const user = await auth.getUser(decodedToken.uid)

      // signInWithCredential(getAuth(firebaseApp)))

      console.log('🔥 setting user', user)

      // provide user
    }
  } else {
    VueFireAuth()(firebaseApp, nuxtApp.vueApp)
    const auth = getAuth(firebaseApp)
    // send a post request to the server when auth state changes to mint a cookie
    onIdTokenChanged(auth, async (user) => {
      const jwtToken = await user?.getIdToken()
      // console.log('📚 updating server cookie with', jwtToken)
      // TODO: error handling: should we call showError() in dev only?
      await $fetch('/api/_vuefire/auth', {
        method: 'POST',
        // if the token is undefined, the server will delete the cookie
        body: { token: jwtToken },
      })
    })
  }
})
