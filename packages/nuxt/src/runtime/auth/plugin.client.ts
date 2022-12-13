import type { FirebaseError, FirebaseApp } from 'firebase/app'
import {
  getAuth,
  onIdTokenChanged,
  beforeAuthStateChanged,
  User,
} from 'firebase/auth'
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
  beforeAuthStateChanged(auth, mintCookie, () => {
    // rollback the auth state
    mintCookie(auth.currentUser)
  })

  // we need both callback to avoid some race conditions
  onIdTokenChanged(auth, mintCookie)
})

/**
 * Sends a post request to the server to mint a cookie based auth session. The name of the cookie is defined in the
 * api.session.ts file.
 *
 * @param user - the user to mint a cookie for
 */
async function mintCookie(user: User | null) {
  const jwtToken = await user?.getIdToken()
  // throws if the server returns an error so that beforeAuthStateChanged can catch it to cancel
  await $fetch('/api/_vuefire/auth', {
    method: 'POST',
    // if the token is undefined, the server will delete the cookie
    body: { token: jwtToken },
  })
}
