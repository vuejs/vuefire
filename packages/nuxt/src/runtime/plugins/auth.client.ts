import type { FirebaseApp } from '@firebase/app-types'
import { VueFireAuth } from 'vuefire'
import { defineNuxtPlugin } from '#app'

/**
 * Initializes the app and provides it to others.
 */

export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  VueFireAuth()(firebaseApp, nuxtApp.vueApp)
})
