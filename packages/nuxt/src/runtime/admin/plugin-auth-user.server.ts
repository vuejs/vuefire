import type { App as AdminApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth, UserRecord } from 'firebase-admin/auth'
import {
  createServerUser,
  decodeUserToken,
  AUTH_COOKIE_NAME,
} from 'vuefire/server'
import { getCookie } from 'h3'
import { UserSymbol } from '../constants'
import { defineNuxtPlugin, useRequestEvent } from '#app'

/**
 * Check if there is a cookie and if it is valid, extracts the user from it. This only requires the admin app.
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const event = useRequestEvent()
  const adminApp = nuxtApp.$firebaseAdminApp as AdminApp
  const adminAuth = getAdminAuth(adminApp)

  const decodedToken = await decodeUserToken(
    getCookie(event, AUTH_COOKIE_NAME),
    adminApp
  )
  const user = await (decodedToken && adminAuth.getUser(decodedToken.uid))

  // expose the user to code
  event.context.user = user
  // for SSR
  nuxtApp.payload.vuefireUser = user?.toJSON()

  // user that has a similar shape for client and server code
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
