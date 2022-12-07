import type { FirebaseApp } from '@firebase/app-types'
import { getAuth, onIdTokenChanged } from 'firebase/auth'
import { VueFireAuth } from 'vuefire'
import { defineNuxtPlugin } from '#app'

/**
 * Setups VueFireAuth and automatically mints a cookie based auth session. On the server, it reads the cookie to
 * generate the proper auth state.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  // TODO: provide the server user?
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
})
