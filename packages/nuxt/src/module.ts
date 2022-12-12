import { fileURLToPath } from 'node:url'
import { normalize } from 'node:path'
import {
  addImports,
  addPlugin,
  addPluginTemplate,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  resolvePath,
} from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
// cannot import from firebase-admin because the build fails, maybe a nuxt bug?
import type { FirebaseApp, FirebaseOptions } from '@firebase/app-types'
import type {
  AppOptions,
  ServiceAccount,
  App as FirebaseAdminApp,
} from 'firebase-admin/app'
import { markRaw } from 'vue'
import type { NuxtVueFireAppCheckOptions } from './runtime/app-check'

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

      // TODO: I don't think the appConfig is the right place to store these as it makes things reactive
      // Let plugins and the user access the firebase config within the app
      nuxt.options.appConfig.firebaseConfig = markRaw(options.config)
      nuxt.options.appConfig.vuefireOptions = markRaw(options)

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
          nuxt.options.appConfig.firebaseAdmin = markRaw(options.admin)
        }
      }

      if (nuxt.options.ssr) {
        addServerHandler({
          route: '/api/_vuefire/auth',
          handler: resolve(runtimeDir, './auth/api.session'),
        })
      }

      // NOTE: the order of the plugins is reversed, so we end by adding the app plugin which is used by all other
      // plugins

      if (options.auth) {
        addPlugin(resolve(runtimeDir, 'auth/plugin.client'))
        // must be added after the admin module to use the admin app
        addPlugin(resolve(runtimeDir, 'auth/plugin.server'))

        addVueFireImports([
          // auth
          { from: 'vuefire', name: 'useFirebaseAuth' },
          { from: 'vuefire', name: 'useCurrentUser' },
        ])
      }

      if (options.appCheck) {
        addPlugin(resolve(runtimeDir, 'app-check/plugin.client'))
        addPlugin(resolve(runtimeDir, 'app-check/plugin.server'))
      }

      // this adds the VueFire plugin and handle SSR state serialization and hydration
      addPluginTemplate({
        src: normalize(resolve(templatesDir, 'plugin.ejs')),

        options: {
          ...options,
          ssr: nuxt.options.ssr,
        },
      })

      // adds the firebase app to each application
      addPlugin(resolve(runtimeDir, 'app/plugin.client'))
      addPlugin(resolve(runtimeDir, 'app/plugin.server'))

      // we start the admin app first so we can have access to the user uid everywhere
      if (options.admin) {
        if (!nuxt.options.ssr) {
          console.warn(
            '[VueFire]: The "admin" option is only used during SSR. You should reenable ssr to use it.'
          )
        }
        // this plugin adds the user so it's accessible directly in the app as well
        if (options.auth) {
          addPlugin(resolve(runtimeDir, 'admin/plugin-auth-user.server'))
        }
        addPlugin(resolve(runtimeDir, 'admin/plugin.server'))
      }

      addVueFireImports([
        // app
        { from: 'vuefire', name: 'useFirebaseApp' },

        // firestore
        { from: 'vuefire', name: 'useDocument' },
        { from: 'vuefire', name: 'useCollection' },
        { from: 'vuefire', name: 'useFirestore' },

        // database
        { from: 'vuefire', name: 'useDatabase' },
        { from: 'vuefire', name: 'useDatabaseList' },
        { from: 'vuefire', name: 'useDatabaseObject' },
      ])
    },

    // NOTE: workaround until https://github.com/vitejs/vite/issues/11114 is fixed
    hooks: {
      // Resolve the correct firebase/firestore path on server only since vite is resolving the wrong one in dev
      'vite:extendConfig': async (config, { isServer }) => {
        if (isServer) {
          config.resolve ??= {}
          config.resolve.alias ??= {}

          // skip the whole thing if the alias is already set in user config
          // @ts-ignore
          if (!config.resolve.alias['firebase/firestore']) {
            // this gives an absolute path which is needed for the alias to work since the firebase package is not including the dist folder in exports
            const resolvedFirestore = await resolvePath('firebase/firestore')
            const resolvedFirestoreMJS =
              resolvedFirestore.slice(
                0,
                resolvedFirestore.lastIndexOf('dist')
              ) + 'dist/index.mjs'
            // @ts-ignore
            config.resolve.alias['firebase/firestore'] = resolvedFirestoreMJS

            const resolvedNamespacedFirestore = await resolvePath(
              '@firebase/firestore'
            )
            const resolvedNamespacedFirestoreMJS =
              resolvedNamespacedFirestore.slice(
                0,
                resolvedNamespacedFirestore.lastIndexOf('dist')
              ) + 'dist/index.node.mjs'
            // @ts-ignore
            config.resolve.alias['@firebase/firestore'] =
              resolvedNamespacedFirestoreMJS
          }

          // add any other firebase alias you need
        }
      },
    },
  })

// just to have autocomplete and errors
type VueFireModuleExportKeys = keyof Awaited<typeof import('vuefire')>
function addVueFireImports(
  imports: Array<{
    from: 'vuefire'
    name: VueFireModuleExportKeys
  }>
) {
  return addImports(imports)
}

export default VueFire
export type {
  NuxtVueFireAppCheckOptions,
  NuxtVueFireAppCheckOptionsReCaptchaV3,
  NuxtVueFireAppCheckOptionsReCaptchaEnterprise,
} from './runtime/app-check'

declare module '@nuxt/schema' {
  export interface AppConfig {
    /**
     * Firebase config to initialize the app.
     * @internal
     */
    firebaseConfig: FirebaseOptions

    /**
     * VueFireNuxt options used within plugins.
     * @internal
     */
    vuefireOptions: Pick<VueFireNuxtModuleOptions, 'appCheck' | 'auth'>

    /**
     * Firebase Admin options passed to VueFire module. Only available on the server.
     * @internal
     */
    firebaseAdmin?: {
      config: Omit<AppOptions, 'credential'>
      serviceAccount: string | ServiceAccount
    }
  }
}

declare module '#app' {
  interface NuxtApp {
    $firebaseApp: FirebaseApp
    $firebaseAdminApp: FirebaseAdminApp
  }
}
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $firebaseApp: FirebaseApp
    $firebaseAdminApp: FirebaseAdminApp
  }
}
