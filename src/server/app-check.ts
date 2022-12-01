import type { app } from 'firebase-admin'
import type { FirebaseApp } from 'firebase/app'
import { CustomProvider, initializeAppCheck } from 'firebase/app-check'

/**
 * Adds AppCheck using the Firebase Admin SDK. This is necessary on the Server if you have configured AppCheck on the
 * client.
 *
 * @param adminApp - firebase-admin app
 * @param firebaseApp - firebase/app initializeApp()
 * @param param2 options
 */
export function VueFireAppCheckServer(
  adminApp: app.App,
  firebaseApp: FirebaseApp,
  {
    // default to 1 week
    ttlMillis = 604_800_000,
  }: {
    ttlMillis?: number
  } = {}
) {
  initializeAppCheck(firebaseApp, {
    provider: new CustomProvider({
      getToken: () =>
        adminApp
          .appCheck()
          // NOTE: appId is checked on the server plugin
          .createToken(firebaseApp.options.appId!, { ttlMillis })
          .then(({ token, ttlMillis: expireTimeMillis }) => ({
            token,
            expireTimeMillis,
          })),
    }),
    isTokenAutoRefreshEnabled: false,
  })
}
