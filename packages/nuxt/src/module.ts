import { fileURLToPath } from 'node:url'
import { normalize } from 'node:path'
import {
  addPlugin,
  addPluginTemplate,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { type FirebaseOptions } from '@firebase/app-types'

export interface VueFireNuxtModuleOptions {
  /**
   * Should we add the `VueFireFirestoreOptionsAPI` and `VueFireRealtimeDatabaseOptionsAPI` modules?. Pass `true` to add
   * both, or `'firestore'` or `'realtime-database'` to add only one. Pass false to disable.
   * @default false
   */
  optionsApiPlugin?: boolean | 'firestore' | 'database'

  config: FirebaseOptions

  /**
   * Optional name passed to `firebase.initializeApp(config, name)`
   */
  appName?: string

  services?: {
    auth?: boolean
    firestore?: boolean
    database?: boolean
    storage?: boolean
  }
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
      config: {},
      services: {},
    },

    setup(options, nuxt) {
      const { resolve } = createResolver(import.meta.url)
      const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
      const templatesDir = fileURLToPath(
        new URL('../templates', import.meta.url)
      )

      // Let plugins and the user access the firebase config within the app
      nuxt.options.appConfig.firebaseConfig = options.config

      if (Object.keys(options.config).length === 0) {
        throw new Error(
          '[VueFire]: Missing firebase config. Provide it to the VueFire module options.'
        )
      }

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

declare module '@nuxt/schema' {
  export interface AppConfig {
    /**
     * Firebase config to initialize the app.
     */
    firebaseConfig: FirebaseOptions
  }
}
