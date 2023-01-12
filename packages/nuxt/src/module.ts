import { fileURLToPath } from 'node:url'
import { normalize } from 'node:path'
import {
  addImports,
  addPlugin,
  addPluginTemplate,
  addServerHandler,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
// cannot import from firebase/app because the build fails, maybe a nuxt bug?
import type { FirebaseApp, FirebaseOptions } from '@firebase/app-types'
import type {
  AppOptions,
  ServiceAccount,
  App as FirebaseAdminApp,
} from 'firebase-admin/app'
import { markRaw } from 'vue'
import type { NuxtVueFireAppCheckOptions } from './runtime/app-check'
import { addMissingAlias } from './firebaseAliases'
import { log } from './runtime/logging'

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
    options?: Omit<AppOptions, 'credential'>

    // TODO: remove, use env variables instead
    /**
     * Firebase Admin Service Account passed to `firebase-admin`'s `initializeApp()`. Required if you are adding an adminConfig.
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
          '[nuxt-vuefire]: Missing firebase config. Provide a "config" option to the VueFire module options.'
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
      nuxt.options.build.transpile.push(templatesDir)

      // FIXME: this is a workaround because of the resolve issue with firebase
      // without this, we use different firebase packages within vuefire and nuxt-vuefire
      nuxt.options.build.transpile.push('vuefire')
      nuxt.options.build.transpile.push('vuefire/server')

      // Add the session handler than mints a cookie for the user
      if (nuxt.options.ssr) {
        addServerHandler({
          route: '/api/__session',
          handler: resolve(runtimeDir, './auth/api.session'),
        })
      }

      // This one is set by servers, we set the GOOGLE_APPLICATION_CREDENTIALS env variable instead that has a lower priority and can be both a path or a JSON string
      // process.env.FIREBASE_CONFIG ||= JSON.stringify(options.config)
      if (typeof options.admin?.serviceAccount === 'string') {
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||=
          options.admin.serviceAccount
      }
      const hasServiceAccount =
        typeof process.env.GOOGLE_APPLICATION_CREDENTIALS === 'string' &&
        process.env.GOOGLE_APPLICATION_CREDENTIALS.length > 0

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
        // these are improved for nuxt to avoid the need to pass the app name
        addImports([
          {
            from: resolve(runtimeDir, 'auth/composables'),
            name: 'getCurrentUser',
          },
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
      // TODO: if options.admin
      if (options.admin || nuxt.options.ssr) {
        if (!nuxt.options.ssr) {
          log(
            'warn',
            'The "admin" option is only used during SSR. You should reenable ssr to use it.'
          )
        }

        // TODO: remove this runtime config if it's not needed as it could include sensitive data
        if (options.admin) {
          nuxt.options.appConfig.firebaseAdmin = markRaw(options.admin)
        }
        // this plugin adds the user so it's accessible directly in the app as well
        if (options.auth) {
          addPlugin(resolve(runtimeDir, 'admin/plugin-auth-user.server'))
        }
        addPlugin(resolve(runtimeDir, 'admin/plugin.server'))
      }

      // Add auto imports that are useful to be auto imported

      // these imports are overridden by nuxt-vuefire to allow being used in more places like plugins and middlewares
      addImports([
        // app
        {
          from: resolve(runtimeDir, 'app/composables'),
          name: 'useFirebaseApp',
        },
      ])

      addVueFireImports([
        // firestore
        { from: 'vuefire', name: 'useFirestore' },
        { from: 'vuefire', name: 'useDocument' },
        { from: 'vuefire', name: 'useCollection' },

        // database
        { from: 'vuefire', name: 'useDatabase' },
        { from: 'vuefire', name: 'useDatabaseList' },
        { from: 'vuefire', name: 'useDatabaseObject' },
      ])

      // NOTE: Because of https://github.com/nuxt/framework/issues/9865
      // otherwise, move to the `hooks` option
      if (nuxt.options.ssr) {
        // NOTE: workaround until https://github.com/vitejs/vite/issues/11114 is fixed
        nuxt.addHooks({
          // Resolve the correct firebase/firestore path on server only since vite is resolving the wrong one in dev
          'vite:extendConfig': async (config, { isServer }) => {
            config.resolve ??= {}
            config.resolve.alias ??= {}
            const aliases: Record<string, string> = config.resolve
              .alias as Record<string, string>

            const promises: Promise<void>[] = []

            if (isServer) {
              promises.push(
                addMissingAlias(aliases, 'firebase/firestore', 'index.mjs')
              )
              promises.push(
                addMissingAlias(
                  aliases,
                  '@firebase/firestore',
                  'index.node.mjs'
                )
              )
            }

            promises.push(addMissingAlias(aliases, 'firebase/app', 'index.mjs'))

            await Promise.all(promises)
          },
        })
      }
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
    firebaseAdmin?: VueFireNuxtModuleOptions['admin']
  }
}

// @ts-ignore: #app not found error when building
declare module '#app' {
  interface NuxtApp {
    /**
     * Firebase App instance.
     */
    $firebaseApp: FirebaseApp
    /**
     * Firebase Admin app. Only available on the server.
     */
    $firebaseAdminApp: FirebaseAdminApp
  }
}
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    /**
     * Firebase App instance.
     */
    $firebaseApp: FirebaseApp
    /**
     * Firebase Admin app. Only available on the server.
     */
    $firebaseAdminApp: FirebaseAdminApp
  }
}
