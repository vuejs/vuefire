import type { App as FirebaseAdminApp } from 'firebase-admin/app'
import type { FirebaseApp } from 'firebase/app'
import { VueFireAppCheckServer } from 'vuefire/server'
import { defineNuxtPlugin } from '#app'

/**
 * Makes AppCheck work on the server. This requires SSR and the admin SDK to be available
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp
  const adminApp = nuxtApp.$firebaseAdminApp as FirebaseAdminApp

  // NOTE: necessary in VueFireAppCheckServer
  if (!firebaseApp.options.appId) {
    throw new Error(
      '[VueFire]: Missing "appId" in firebase config. This is necessary to use the app-check module on the server.'
    )
  }

  VueFireAppCheckServer(nuxtApp.vueApp, adminApp, firebaseApp)
})
