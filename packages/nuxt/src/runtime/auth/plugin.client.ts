import type { FirebaseApp } from 'firebase/app'
import { VueFireAuth } from 'vuefire'
import { defineNuxtPlugin } from '#app'

/**
 * Setups VueFireAuth for the client. This version creates some listeners that shouldn't be set on server.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  // @ts-expect-error: FIXME: type it
  VueFireAuth(nuxtApp.payload.vuefireUser)(firebaseApp, nuxtApp.vueApp)
})
