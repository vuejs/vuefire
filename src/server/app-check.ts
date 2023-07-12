import type { App as FirebaseAdminApp } from 'firebase-admin/app'
import { getAppCheck as getAdminAppCheck } from 'firebase-admin/app-check'
import type { FirebaseApp } from 'firebase/app'
import {
  CustomProvider,
  initializeAppCheck,
  type AppCheckToken,
} from 'firebase/app-check'
import { type App, ref } from 'vue-demi'
import { AppCheckMap, AppCheckTokenInjectSymbol } from '../app-check'
import { getGlobalScope } from '../globals'
import { log } from './logging'

/**
 * Adds AppCheck using the Firebase Admin SDK. This is necessary on the Server if you have configured AppCheck on the
 * client.
 *
 * @param adminApp - firebase-admin app
 * @param firebaseApp - firebase/app initializeApp()
 * @param param2 options
 */
export function VueFireAppCheckServer(
  app: App,
  adminApp: FirebaseAdminApp,
  firebaseApp: FirebaseApp,
  {
    // default to 1 week
    ttlMillis = 604_800_000,
  }: {
    ttlMillis?: number
  } = {}
) {
  // Inject an empty token ref so the same code works on the client and server
  const providedToken = getGlobalScope(firebaseApp, app).run(() =>
    ref<string>()
  )!
  app.provide(AppCheckTokenInjectSymbol, providedToken)

  // FIXME: do we need to avoid creating the appcheck instance on the server?
  if (AppCheckMap.has(firebaseApp)) {
    log('info', 'AppCheck already initialized, skipping server initialization.')
    return
  }

  console.log('[VueFire]: Initializing AppCheck on the server')

  let currentToken: AppCheckToken | undefined
  const appCheck = initializeAppCheck(firebaseApp, {
    provider: new CustomProvider({
      getToken: () => {
        // FIXME: without this there is an infinite loop
        if (currentToken) {
          log('info', 'Using cached AppCheck token on server.')
          return Promise.resolve(currentToken)
        }
        log('info', 'Getting Admin AppCheck')
        const adminAppCheck = getAdminAppCheck(adminApp)
        // NOTE: appId is checked on the module
        log('info', `Creating token for app ${firebaseApp.options.appId!}.`)

        return adminAppCheck
          .createToken(firebaseApp.options.appId!, { ttlMillis })
          .then(({ token, ttlMillis: expireTimeMillis }) => {
            log(
              'info',
              `Got AppCheck token from the server, expires in ${expireTimeMillis}ms.`
            )
            // expire the token after the ttl
            // TODO: verify this is okay
            setTimeout(() => {
              currentToken = undefined
            }, expireTimeMillis)

            currentToken = {
              token,
              expireTimeMillis,
            }
            return currentToken
          })
          .catch((reason) => {
            log(
              'error',
              'Error getting AppCheck token from the server:',
              reason
            )
            throw reason
          })
      },
    }),
    isTokenAutoRefreshEnabled: false,
  })
  AppCheckMap.set(firebaseApp, appCheck)
}
