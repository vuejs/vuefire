import {
  initializeApp,
  cert,
  getApp,
  getApps,
  ServiceAccount,
} from 'firebase-admin/app'
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
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
      process.env
    // we need either a serviceAccount or the env variables
    let serviceAccountOrProject: string | ServiceAccount

    if (FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY && FIREBASE_PROJECT_ID) {
      // This version should work in Firebase Functions and other providers while applicationDefault() only works on
      serviceAccountOrProject = {
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        // replace `\` and `n` character pairs w/ single `\n` character
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }
    } else if (firebaseAdmin.serviceAccount) {
      serviceAccountOrProject = firebaseAdmin.serviceAccount
    } else {
      throw new Error(
        '[VueFire]: You must provide a "serviceAccount" (dev) or set the FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY and FIREBASE_PROJECT_ID env variables production.'
      )
    }

    initializeApp({
      // TODO: is this really going to be used?
      ...firebaseAdmin.config,
      credential: cert(serviceAccountOrProject),
    })
  }

  const firebaseAdminApp = getApp()

  return {
    provide: {
      firebaseAdminApp,
    },
  }
})
