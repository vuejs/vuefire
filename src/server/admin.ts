import {
  initializeApp,
  cert,
  getApp,
  getApps,
  applicationDefault,
  // renamed because there seems to be a global Credential type in vscode
  Credential as FirebaseAdminCredential,
  AppOptions,
} from 'firebase-admin/app'
import { log } from './logging'

/**
 * Setups a Firebase Admin App
 *
 * @param firebaseAdminOptions - options to pass to the admin app
 * @experimental this is experimental and may change in the future
 */
export function getAdminApp(
  firebaseAdminOptions?: Omit<AppOptions, 'credential'>
) {
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
      GOOGLE_APPLICATION_CREDENTIALS,
    } = process.env

    log('debug', 'Detected environment variables', {
      FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: FIREBASE_PRIVATE_KEY && '****',
      FIREBASE_CONFIG,
      FUNCTION_NAME,
      GOOGLE_APPLICATION_CREDENTIALS,
    })

    if (FIREBASE_CONFIG || FUNCTION_NAME) {
      // TODO: last time I tried this one fails on the server
      log('debug', `using FIREBASE_CONFIG env variable for ${FUNCTION_NAME}`)
      initializeApp()
    } else {
      let credential: FirebaseAdminCredential

      if (GOOGLE_APPLICATION_CREDENTIALS) {
        if (
          typeof GOOGLE_APPLICATION_CREDENTIALS === 'string' &&
          // ensure it's an object
          GOOGLE_APPLICATION_CREDENTIALS[0] === '{'
        ) {
          log(
            'debug',
            'Parsing GOOGLE_APPLICATION_CREDENTIALS env variable as JSON'
          )
          const certObject = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS)
          // TODO: some dev only warning about format
          // replace `\` and `n` character pairs w/ single `\n` character
          certObject.private_key = certObject.private_key?.replace(/\\n/g, '\n')
          if (!certObject.private_key) {
            throw new Error(
              'private_key is missing in GOOGLE_APPLICATION_CREDENTIALS json'
            )
          }
          credential = cert(certObject)
        } else {
          log(
            'debug',
            'using GOOGLE_APPLICATION_CREDENTIALS env variable as a file path'
          )
          credential = cert(GOOGLE_APPLICATION_CREDENTIALS)
        }
      } else if (FIREBASE_PRIVATE_KEY) {
        // This version should work in Firebase Functions and other providers while applicationDefault() only works on
        // Firebase deployments
        log('debug', 'using FIREBASE_PRIVATE_KEY env variable')
        credential = cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          // replace `\` and `n` character pairs w/ single `\n` character
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      } else {
        // automatically picks up the service account file path from the env variable
        log('debug', 'using applicationDefault()')
        credential = applicationDefault()
      }
      // No credentials were provided, this will fail so we throw an explicit error
      // TODO: add link to vuefire docs
      //         log(
      //           'warn',
      //           `\
      // You must provide admin credentials during development. See https://firebase.google.com/docs/admin/setup#initialize-sdk for more information. It must be made available through GOOGLE_APPLICATION_CREDENTIALS env variable as a full resolved path or a JSON string.
      // You can also set the FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY and FIREBASE_PROJECT_ID env variables. Note this environment variable is automatically set on Firebase Cloud Functions.\
      // `
      //         )
      //         throw new Error('admin-app/missing-credentials')

      initializeApp({
        // TODO: is this really going to be used?
        ...firebaseAdminOptions,
        credential,
      })
    }
  }

  // we know have a valid admin app
  return getApp()!
}
