import {
  initializeApp,
  cert,
  getApp,
  getApps,
  applicationDefault,
  // renamed because there seems to be a global Credential type in vscode
  Credential as FirebaseAdminCredential,
  App as AdminApp,
} from 'firebase-admin/app'
import { log } from '../logging'
import { defineNuxtPlugin, useAppConfig, useRequestEvent } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const event = useRequestEvent()
  // only initialize the admin sdk once
  if (!getApps().length) {
    const { firebaseAdmin } = useAppConfig()
    const {
      // these can be set by the user on other platforms
      FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY,
      // set on firebase cloud functions
      FIREBASE_CONFIG,
      // in cloud functions, we can auto initialize
      FUNCTION_NAME,
      GOOGLE_APPLICATION_CREDENTIALS,
    } = process.env

    if (FIREBASE_CONFIG || FUNCTION_NAME) {
      log('debug', 'using FIREBASE_CONFIG env variable')
      initializeApp()
    } else {
      let credential: FirebaseAdminCredential
      // This version should work in Firebase Functions and other providers while applicationDefault() only works on
      // Firebase deployments
      if (FIREBASE_PRIVATE_KEY) {
        log('debug', 'using FIREBASE_PRIVATE_KEY env variable')
        credential = cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          // replace `\` and `n` character pairs w/ single `\n` character
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        if (
          typeof GOOGLE_APPLICATION_CREDENTIALS === 'string' &&
          // ensure it's an object
          GOOGLE_APPLICATION_CREDENTIALS[0] === '{'
        ) {
          log(
            'debug',
            'Parsing GOOGLE_APPLICATION_CREDENTIALS env variable as JSON'
          )
          credential = cert(JSON.parse(GOOGLE_APPLICATION_CREDENTIALS))
        } else {
          // automatically picks up the service account file path from the env variable
          log('debug', 'using applicationDefault()')
          credential = applicationDefault()
        }
      } else {
        // No credentials were provided, this will fail so we throw an explicit error
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
        ...firebaseAdmin?.options,
        credential,
      })
    }
  }

  const firebaseAdminApp = getApp()
  // TODO: Is this accessible within middlewares and api routes? or should be use a middleware to add it
  event.context.firebaseApp = firebaseAdminApp

  return {
    provide: {
      firebaseAdminApp,
    },
  }
})

// TODO: should the type extensions be added in a different way to the module?
declare module 'h3' {
  interface H3EventContext {
    /**
     * Firebase Admin User Record. `null` if the user is not logged in or their token is no longer valid and requires a
     * refresh.
     * @experimental This API is experimental and may change in future releases.
     */
    firebaseApp: AdminApp
  }
}
