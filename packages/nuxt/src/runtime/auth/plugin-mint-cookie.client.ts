import type { FirebaseApp } from 'firebase/app'
import {
  getAuth,
  onIdTokenChanged,
  beforeAuthStateChanged,
  User,
} from 'firebase/auth'
import { defineNuxtPlugin } from '#app'

/**
 * Sets up a watcher that mints a cookie based auth session. On the server, it reads the cookie to
 * generate the proper auth state. **Must be added after the firebase auth plugin.**
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  const auth = getAuth(firebaseApp)
  // send a post request to the server when auth state changes to mint a cookie
  beforeAuthStateChanged(
    auth,
    // if this fails, we rollback the auth state
    mintCookie,
    () => {
      // rollback the auth state
      mintCookie(auth.currentUser)
    }
  )

  // we need both callback to avoid some race conditions
  onIdTokenChanged(auth, mintCookie)
})

// TODO: should this be throttled to avoid multiple calls
/**
 * Sends a post request to the server to mint a cookie based auth session. The name of the cookie is defined in the
 * api.session.ts file.
 *
 * @param user - the user to mint a cookie for
 */
async function mintCookie(user: User | null) {
  const jwtToken = await user?.getIdToken(/* forceRefresh */ true)
  // throws if the server returns an error so that beforeAuthStateChanged can catch it to cancel
  await $fetch(
    // '/api/__session-server',
    '/api/__session',
    {
      method: 'POST',
      // if the token is undefined, the server will delete the cookie
      body: { token: jwtToken },
    }
  )
}
