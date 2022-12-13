import { initializeApp, cert, getApp, getApps } from 'firebase-admin/app'
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
    if (
      !firebaseAdmin.serviceAccount &&
      (!FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY || !FIREBASE_PROJECT_ID)
    ) {
      throw new Error(
        '[VueFire]: You must provide a "serviceAccount" or set the FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY and FIREBASE_PROJECT_ID env variables.'
      )
    }
    initializeApp({
      // TODO: is this really going to be used?
      ...firebaseAdmin.config,
      credential: cert(
        firebaseAdmin.serviceAccount || {
          // This version should work in Firebase Functions and other providers while applicationDefault() only works on
          // Firebase Functions. All values must exists because of the check above.
          projectId: FIREBASE_PROJECT_ID!,
          clientEmail: FIREBASE_CLIENT_EMAIL!,
          // replace `\` and `n` character pairs w/ single `\n` character
          privateKey: FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }
      ),
    })
  }

  const firebaseAdminApp = getApp()

  return {
    provide: {
      firebaseAdminApp,
    },
  }
})
