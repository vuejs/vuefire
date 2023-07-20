import type { FirebaseOptions } from '@firebase/app-types'
import type { AppOptions, ServiceAccount } from 'firebase-admin'
import type { NuxtVueFireAppCheckOptions } from '../runtime/app-check'

export interface VueFireNuxtModuleOptions {
  /**
   * Should we add the `VueFireFirestoreOptionsAPI` and `VueFireRealtimeDatabaseOptionsAPI` modules?. Pass `true` to add
   * both, or `'firestore'` or `'realtime-database'` to add only one. Pass false to disable.
   * @default false
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

    /**
     * Firebase Admin Service Account passed to `firebase-admin`'s `initializeApp()`. Required if you are adding an
     * adminConfig.
     * @deprecated use GOOGLE_APPLICATION_CREDENTIALS env variable instead with the service-account JSON content
     */
    serviceAccount?: string | ServiceAccount
  }

  /**
   * Enables AppCheck on the client and server. Note you only need to pass the options for the client, on the server,
   * the configuration will be handled automatically.
   */
  appCheck?: NuxtVueFireAppCheckOptions

  /**
   * Enables Authentication
   */
  auth?: boolean

  /**
   * Controls whether to use emulators or not. Pass `false` to disable emulators. When set to `true`, emulators are
   * enabled when they are detected in the `firebase.json` file. You still need to run the emulators in parallel to your
   * app.
   *
   * @default true
   * @experimental
   */
  emulators?:
    | boolean
    | {
        /**
         * The host for the Firestore emulator. Defaults to `localhost`.
         */
        host?: string
      }
}
