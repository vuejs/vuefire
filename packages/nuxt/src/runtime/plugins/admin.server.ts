import admin from 'firebase-admin'
import { VueFireAppCheckServer } from 'vuefire/server'
import { config } from 'firebase-functions'
import type { FirebaseApp } from '@firebase/app-types'
import { defineNuxtPlugin, useAppConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const appConfig = useAppConfig()

  const { firebaseConfig, firebaseAdmin, vuefireOptions } = appConfig

  // the admin sdk is not always needed
  if (!firebaseAdmin?.config) {
    return
  }

  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  // only initialize the admin sdk once
  if (!admin.apps.length) {
    const adminApp = admin.initializeApp({
      ...firebaseAdmin.config,
      credential:
        // when deployed we get direct access to the config
        process.env.NODE_ENV === 'production'
          ? config().firebase
          : admin.credential.cert(firebaseAdmin.serviceAccount),
    })

    if (vuefireOptions.appCheck) {
      // NOTE: necessary in VueFireAppCheckServer
      if (!firebaseApp.options.appId) {
        throw new Error(
          '[VueFire]: Missing "appId" in firebase config. This is necessary to use the app-check module on the server.'
        )
      }

      VueFireAppCheckServer(adminApp, firebaseApp)
    }
  }

  return {
    provide: {
      adminApp: admin.app(),
    },
  }
})
