import {
  initializeApp,
  cert,
  getApp,
  getApps,
  applicationDefault,
  // renamed because there seems to be a global Credential type in vscode
  Credential as FirebaseAdminCredential,
} from 'firebase-admin/app'
import { log } from '../logging'
import { defineNuxtPlugin, useAppConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const appConfig = useAppConfig()

  const { firebaseAdmin } = appConfig

  // only initialize the admin sdk once
  if (!getApps().length) {
    const {
      // these can be set by the user on other platforms
      FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY,
      // set on firebase cloud functions
      FIREBASE_CONFIG,
      // in cloud functions, we can auto initialize
      FUNCTION_NAME,
    } = process.env

    if (FIREBASE_CONFIG || FUNCTION_NAME) {
      log('using FIREBASE_CONFIG env variable')
      initializeApp()
    } else {
      let credential: FirebaseAdminCredential
      // This version should work in Firebase Functions and other providers while applicationDefault() only works on
      if (FIREBASE_PRIVATE_KEY) {
        log('using FIREBASE_PRIVATE_KEY env variable')
        credential = cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          // replace `\` and `n` character pairs w/ single `\n` character
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        log('using GOOGLE_APPLICATION_CREDENTIALS env variable')
        // automatically picks up the service account file path from the env variable
        credential = applicationDefault()
      } else {
        // TODO: add link to vuefire docs
        log(
          'warn',
          `\
You must provide an "admin.serviceAccount" path to your json so it's picked up during development. See https://firebase.google.com/docs/admin/setup#initialize-sdk for more information. Note that you can also set the GOOGLE_APPLICATION_CREDENTIALS env variable to a full resolved path or a JSON string.
You can also set the FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY and FIREBASE_PROJECT_ID env variables in production if you are deploying to something else than Firebase Cloud Functions.
`
        )
        throw new Error('admin-app/missing-credentials')
      }

      initializeApp({
        // TODO: is this really going to be used?
        ...firebaseAdmin?.config,
        credential,
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
