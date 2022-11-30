import type { app } from 'firebase-admin'
import { CustomProvider, initializeAppCheck } from 'firebase/app-check'

/**
 * Adds AppCheck using the Firebase Admin SDK. This is necessary on the Server if you have configured AppCheck on the
 * client.
 *
 * @param adminApp - firebase-admin app
 * @param appId - appId option passed to firebase/app initializeApp()
 * @param param2 options
 */
export function VueFireAppCheckServer(
  adminApp: app.App,
  appId: string,
  {
    // default to 1 week
    ttlMillis = 604_800_000,
  }: {
    ttlMillis?: number
  } = {}
) {
  initializeAppCheck(undefined, {
    provider: new CustomProvider({
      getToken: () =>
        adminApp
          .appCheck()
          .createToken(appId, { ttlMillis })
          .then(({ token, ttlMillis: expireTimeMillis }) => ({
            token,
            expireTimeMillis,
          })),
    }),
    isTokenAutoRefreshEnabled: false,
  })
}
