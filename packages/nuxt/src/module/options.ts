import type { FirebaseOptions } from 'firebase/app'
import type { AppOptions } from 'firebase-admin'
import type { NuxtVueFireAppCheckOptions } from '../runtime/app-check'

export interface VueFireNuxtAuthDependencies {
  /**
   * Map of errors. Defaults to debug during dev and to prod during production. Should not be changed unless you know
   * what you are doing.
   */
  errorMap?: 'debug' | 'prod' | false

  /**
   * The popup redirect resolver. Defaults to `browser`. Can be set to `false` to disable it.
   */
  popupRedirectResolver?: 'browser' | false

  /**
   * The persistence to use. Defaults to `['indexedDBLocal', 'browserLocal']`.
   */
  persistence?: Array<
    'indexedDBLocal' | 'browserLocal' | 'browserSession' | 'inMemory'
  >
}

export interface VueFireNuxtModuleOptions {
  /**
   * Should we add the `VueFireFirestoreOptionsAPI` and `VueFireRealtimeDatabaseOptionsAPI` modules?. Pass `true` to add
   * both, or `'firestore'` or `'realtime-database'` to add only one. Pass false to disable.
   * @defaultValue `false`
   */
  optionsApiPlugin?: boolean | 'firestore' | 'database'

  /**
   * Firebase Options passed to `firebase/app`'s `initializeApp()`.
   */
  config?: FirebaseOptions

  /**
   * Firebase Admin Options.
   */
  admin?: {
    /**
     * Firebase Admin Options passed to `firebase-admin`'s `initializeApp()`.
     */
    options?: Omit<AppOptions, 'credential'>
  }

  /**
   * Enables AppCheck on the client and server. Note you only need to pass the options for the client, on the server,
   * the configuration will be handled automatically.
   */
  appCheck?: NuxtVueFireAppCheckOptions

  /**
   * Enables the Authentication module without the session cookie. Pass an object to enable other features.
   * @defaultValue `false`
   */
  auth?:
    | boolean
    | ({
        /**
         * Adds the Authentication module to VueFire.
         * @defaultValue `false`
         */
        enabled?: boolean

        /**
         * Enables the `/api/__session` endpoint to mint cookies and verifying the user during SSR. This requires you to
         * configure a [valid Service
         * Account](https://vuefire.vuejs.org/nuxt/getting-started.html#Configuring-the-Admin-SDK) and the valid
         * permissions on your Google Cloud project. You can find more information about what happens behind the scenes
         * in Firebase docs: [Manage Session Cookies](https://firebase.google.com/docs/auth/admin/manage-cookies).
         */
        sessionCookie?: boolean
      } & VueFireNuxtAuthDependencies)

  /**
   * Controls whether to use emulators or not. Pass `false` to disable emulators. When set to `true`, emulators are
   * enabled when they are detected in the `firebase.json` file. You still need to run the emulators in parallel to your
   * app.
   *
   * @defaultValue `true`
   * @experimental
   */
  emulators?:
    | boolean
    | {
        /**
         * Enables the emulators.
         */
        enabled?: boolean

        /**
         * The host for the Firestore emulator. Defaults to `localhost`.
         */
        host?: string

        auth?: {
          /**
           * Pass options to `firebase/auth`'s `connectAuthEmulator()`.
           */
          options?: Parameters<
            typeof import('firebase/auth').connectAuthEmulator
          >[2]
        }
      }
}

export interface VueFireNuxtModuleOptionsResolved
  extends Omit<VueFireNuxtModuleOptions, 'emulators' | 'auth' | 'config'> {
  config: Exclude<VueFireNuxtModuleOptions['config'], undefined>
  emulators: Exclude<VueFireNuxtModuleOptions['emulators'], boolean | undefined>
  auth: Exclude<VueFireNuxtModuleOptions['auth'], boolean | undefined>
}
