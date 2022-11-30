import admin from 'firebase-admin'
import { VueFireAppCheckServer } from 'vuefire/server'
import { defineNuxtPlugin, useAppConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const appConfig = useAppConfig()

  const { firebaseConfig, firebaseAdmin, vuefireOptions } = appConfig

  // the admin sdk is not always needed
  if (!firebaseAdmin?.config) {
    return
  }

  // only initialize the admin sdk once
  if (!admin.apps.length) {
    const adminApp = admin.initializeApp({
      ...firebaseAdmin.config,
      credential: admin.credential.cert(firebaseAdmin.serviceAccount),
    })

    if (vuefireOptions.appCheck) {
      if (!firebaseConfig.appId) {
        throw new Error(
          '[VueFire]: Missing "appId" in firebase config. This is necessary to use the app-check module on the server.'
        )
      }
      VueFireAppCheckServer(adminApp, firebaseConfig.appId)
    }
  }

  return {
    adminApp: admin.app(),
  }
})
