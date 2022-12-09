import { initializeApp, cert, getApp, getApps } from 'firebase-admin/app'
import type { FirebaseApp } from '@firebase/app-types'
import { defineNuxtPlugin, useAppConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const appConfig = useAppConfig()

  const { firebaseAdmin } = appConfig

  // the admin sdk is not always needed, skip if not provided
  if (!firebaseAdmin?.config) {
    return
  }

  // only initialize the admin sdk once
  if (!getApps().length) {
    // this is specified when deployed on Firebase and automatically picks up the credentials from env variables
    if (process.env.GCLOUD_PROJECT) {
      initializeApp()
    } else {
      initializeApp({
        // TODO: is this really going to be used?
        ...firebaseAdmin.config,
        credential: cert(firebaseAdmin.serviceAccount),
      })
    }
  }

  const firebaseAdminApp = getApp()

  return {
    provide: {
      firebaseAdminApp,
    },
  }
})
