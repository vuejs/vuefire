import type { App as AdminApp } from 'firebase-admin/app'
import { decodeSessionCookie, AUTH_COOKIE_NAME } from 'vuefire/server'
import { getCookie } from 'h3'
import { DECODED_ID_TOKEN_SYMBOL } from '../constants'
import { defineNuxtPlugin, useRequestEvent } from '#imports'

/**
 * Decodes the user token if any. Should only be added on the server and before the firebase/app
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const event = useRequestEvent()
  const adminApp = nuxtApp.$firebaseAdminApp as AdminApp

  const decodedToken = await decodeSessionCookie(
    event && getCookie(event, AUTH_COOKIE_NAME),
    adminApp
  )

  nuxtApp[
    // we cannot use symbol to index
    DECODED_ID_TOKEN_SYMBOL as unknown as string
  ] = decodedToken
})
