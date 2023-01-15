import type { FirebaseApp } from 'firebase/app'
import { VueFireAuth } from 'vuefire'
import { defineNuxtPlugin } from '#app'

/**
 * Setups VueFireAuth for the client.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  VueFireAuth(nuxtApp.payload.vuefireUser)(firebaseApp, nuxtApp.vueApp)
})
