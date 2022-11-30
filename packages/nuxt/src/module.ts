import { fileURLToPath } from 'node:url'
import { normalize } from 'node:path'
import {
  addPlugin,
  addPluginTemplate,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import type { FirebaseOptions } from '@firebase/app-types'
import type { NuxtVueFireAppCheckOptions } from './app-check'

export interface VueFireNuxtModuleOptions {
  /**
   * Should we add the `VueFireFirestoreOptionsAPI` and `VueFireRealtimeDatabaseOptionsAPI` modules?. Pass `true` to add
   * both, or `'firestore'` or `'realtime-database'` to add only one. Pass false to disable.
   * @default false
   */
  optionsApiPlugin?: boolean | 'firestore' | 'database'

  config?: FirebaseOptions

  /**
   * Optional name passed to `firebase.initializeApp(config, name)`
   */
  appName?: string

  /**
   * Enables AppCheck
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
      nuxt.options.appConfig.appCheck = options.appCheck

      // nuxt.options.build.transpile.push(templatesDir)
      nuxt.options.build.transpile.push(runtimeDir)

      nuxt.hook('modules:done', () => {
        // addPlugin(resolve(runtimeDir, 'plugin'))

        addPluginTemplate({
          src: normalize(resolve(templatesDir, 'plugin.ejs')),

          options: {
            ...options,
          },
        })
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
     * AppCheck options passed to VueFire module.
     */
    appCheck?: NuxtVueFireAppCheckOptions
  }
}
