import { fileURLToPath } from 'node:url'
import { normalize } from 'node:path'
import {
  addPlugin,
  addPluginTemplate,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
// cannot import from firebase-admin because the build fails, maybe a nuxt bug?
import type { FirebaseOptions } from '@firebase/app-types'
import type { AppOptions, ServiceAccount } from 'firebase-admin'
import type { NuxtVueFireAppCheckOptions } from './app-check'

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
     * Firebase Admin Options passed to `firebase-admin`'s `initializeApp()`. Required if you are using the auth, or the
     * app-check module.
     */
    config: Omit<AppOptions, 'credential'>

    /**
     * Firebase Admin Service Account passed to `firebase-admin`'s `initializeApp()`. Required if you are adding an adminConfig
     */
    serviceAccount: string | ServiceAccount
  }

  /**
   * Optional name passed to `firebase.initializeApp(config, name)`
   */
  // TODO: is this useful?
  // NOTE: this should probably be inferred automatically based on the auth status to have one app per user cached on the server
  // appName?: string

  /**
   * Enables AppCheck on the client and server. Note you only need to pass the options for the client, on the server,
   * the configuration will be handled automatically.
   */
  appCheck?: NuxtVueFireAppCheckOptions

  /**
   * Enables Authentication
   */
  auth?: boolean
}

// Manual to avoid build error
const VueFire: NuxtModule<VueFireNuxtModuleOptions> =
  defineNuxtModule<VueFireNuxtModuleOptions>({
    meta: {
      name: 'vuefire',
      configKey: 'vuefire',
      compatibility: {
        nuxt: '^3.0.0',
      },
    },

    defaults: {
      optionsApiPlugin: false,
    },

    setup(options, nuxt) {
      // ensure provided options are valid
      if (!options.config) {
        throw new Error(
          '[VueFire]: Missing firebase config. Provide a "config" option to the VueFire module options.'
        )
      }

      const { resolve } = createResolver(import.meta.url)
      const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
      const templatesDir = fileURLToPath(
        new URL('../templates', import.meta.url)
      )

      // Let plugins and the user access the firebase config within the app
      nuxt.options.appConfig.firebaseConfig = options.config
      nuxt.options.appConfig.vuefireOptions = options

      // nuxt.options.build.transpile.push(templatesDir)
      nuxt.options.build.transpile.push(runtimeDir)
      // FIXME: this is a workaround because of the resolve issue with firebase
      // without this, we use different firebase packages within vuefire and nuxt-vuefire
      nuxt.options.build.transpile.push('vuefire')
      nuxt.options.build.transpile.push('vuefire/server')

      if (nuxt.options.ssr && options.admin) {
        // check the provided config is valid
        if (options.auth || options.appCheck) {
          if (!options.admin.config || !options.admin.serviceAccount) {
            throw new Error(
              '[VueFire]: Missing firebase "admin" config. Provide an "admin" option to the VueFire module options. This is necessary to use the auth or app-check module.'
            )
          }
          nuxt.options.appConfig.firebaseAdmin = options.admin
        }
      }

      nuxt.hook('modules:done', () => {
        // plugin are added in reverse order
        addPluginTemplate({
          src: normalize(resolve(templatesDir, 'plugin.ejs')),

          options: {
            ...options,
            ssr: nuxt.options.ssr,
          },
        })
        addPlugin(resolve(runtimeDir, 'plugins/admin.server'))
        addPlugin(resolve(runtimeDir, 'plugins/app'))
      })
    },
  })

export default VueFire
export type {
  NuxtVueFireAppCheckOptions,
  NuxtVueFireAppCheckOptionsReCaptchaV3,
  NuxtVueFireAppCheckOptionsReCaptchaEnterprise,
} from './app-check'

declare module '@nuxt/schema' {
  export interface AppConfig {
    /**
     * Firebase config to initialize the app.
     */
    firebaseConfig: FirebaseOptions

    /**
     * VueFireNuxt options used within plugins.
     * @internal
     */
    vuefireOptions: Pick<VueFireNuxtModuleOptions, 'appCheck' | 'auth'>

    /**
     * Firebase Admin options passed to VueFire module. Only available on the server.
     */
    firebaseAdmin?: {
      config: Omit<AppOptions, 'credential'>
      serviceAccount: string | ServiceAccount
    }
  }
}
