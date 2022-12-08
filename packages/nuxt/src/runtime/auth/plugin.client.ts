import type { FirebaseError, FirebaseApp } from 'firebase/app'
import { getAuth, onIdTokenChanged } from 'firebase/auth'
import { VueFireAuth } from 'vuefire'
import { defineNuxtPlugin, showError } from '#app'

/**
 * Setups VueFireAuth and automatically mints a cookie based auth session. On the server, it reads the cookie to
 * generate the proper auth state.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  VueFireAuth(nuxtApp.payload.vuefireUser)(firebaseApp, nuxtApp.vueApp)
  const auth = getAuth(firebaseApp)
  // send a post request to the server when auth state changes to mint a cookie
  onIdTokenChanged(auth, async (user) => {
    const jwtToken = await user?.getIdToken()
    $fetch('/api/_vuefire/auth', {
      method: 'POST',
      // if the token is undefined, the server will delete the cookie
      body: { token: jwtToken },
    }).catch((reason: FirebaseError) => {
      // there is no need to return a rejected error as `onIdTokenChanged` won't use it
      showError(reason)
    })
  })
})
