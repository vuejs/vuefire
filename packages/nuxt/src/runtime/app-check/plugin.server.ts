import type { App as FirebaseAdminApp } from 'firebase-admin/app'
import type { FirebaseApp } from 'firebase/app'
import { CustomProvider } from 'firebase/app-check'
import { VueFireAppCheck } from 'vuefire'
import { VueFireAppCheckServer } from 'vuefire/server'
import { defineNuxtPlugin, useAppConfig } from '#app'

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

  const appConfig = useAppConfig()
  const options = appConfig.vuefireOptions.appCheck!

  VueFireAppCheckServer(adminApp, firebaseApp)

  // This will fail if used in the server
  const provider = new CustomProvider({
    getToken: () =>
      Promise.reject(
        new Error("[VueFire]: This shouldn't be called on server.")
      ),
  })

  // injects the empty token symbol
  VueFireAppCheck({
    ...options,
    provider,
  })(firebaseApp, nuxtApp.vueApp)
})
