import type { App as AdminApp } from 'firebase-admin/app'
import { decodeUserToken, AUTH_COOKIE_NAME } from 'vuefire/server'
import { getCookie } from 'h3'
import { DECODED_ID_TOKEN_SYMBOL } from '../constants'
import { defineNuxtPlugin, useRequestEvent } from '#app'

// TODO: move this to auth and adapt the module to load it in the right order

/**
 * Decodes the user token if any. Should only be added on the server and before the firebase/app
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const event = useRequestEvent()
  const adminApp = nuxtApp.$firebaseAdminApp as AdminApp

  // log('debug', '🔥 Plugin auth user server')

  const decodedToken = await decodeUserToken(
    getCookie(event, AUTH_COOKIE_NAME),
    adminApp
  )

  nuxtApp[
    // we cannot use symbol to index
    DECODED_ID_TOKEN_SYMBOL as unknown as string
  ] = decodedToken
})
