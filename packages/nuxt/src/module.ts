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
// cannot import from firebase/app because the build fails, maybe a nuxt bug?
import type { FirebaseApp, FirebaseOptions } from '@firebase/app-types'
import type { AppOptions, App as FirebaseAdminApp } from 'firebase-admin/app'
import { markRaw } from 'vue'
import { consola } from 'consola'
import { VueFireNuxtModuleOptions } from './module/options'
import { FirebaseEmulatorsToEnable, detectEmulators } from './module/emulators'

const logger = consola.withTag('nuxt-vuefire module')

export default defineNuxtModule<VueFireNuxtModuleOptions>({
  meta: {
    name: 'vuefire',
    configKey: 'vuefire',
    compatibility: {
      nuxt: '^3.1.0',
    },
  },

  defaults: {
    optionsApiPlugin: false,
    emulators: true,
  },

  async setup(options, nuxt) {
    // ensure provided options are valid
    if (!options.config) {
      throw new Error(
        '[nuxt-vuefire]: Missing firebase config. Provide a "config" option to the VueFire module options.'
      )
    }

    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    const templatesDir = fileURLToPath(new URL('../templates', import.meta.url))

    // to handle TimeStamp and GeoPoints objects
    addPlugin(resolve(runtimeDir, 'payload-plugin'))

    // TODO: I don't think the appConfig is the right place to store these as it makes things reactive
    // Let plugins and the user access the firebase config within the app
    nuxt.options.appConfig.firebaseConfig = markRaw(options.config)
    nuxt.options.appConfig.vuefireOptions = markRaw(options)

    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.build.transpile.push(templatesDir)

    // This one is set by servers, we set the GOOGLE_APPLICATION_CREDENTIALS env variable instead that has a lower priority and can be both a path or a JSON string
    // process.env.FIREBASE_CONFIG ||= JSON.stringify(options.config)
    if (typeof options.admin?.serviceAccount === 'string') {
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||=
        options.admin.serviceAccount
    }
    const hasServiceAccount =
      typeof process.env.GOOGLE_APPLICATION_CREDENTIALS === 'string' &&
      process.env.GOOGLE_APPLICATION_CREDENTIALS.length > 0

    // resolve the credentials in case of monorepos and other projects started from a different folder
    if (
      typeof process.env.GOOGLE_APPLICATION_CREDENTIALS === 'string' &&
      process.env.GOOGLE_APPLICATION_CREDENTIALS?.[0] !== '{'
    ) {
      const resolvedCredentials = resolve(
        nuxt.options.rootDir,
        process.env.GOOGLE_APPLICATION_CREDENTIALS
      )
      process.env.GOOGLE_APPLICATION_CREDENTIALS = resolvedCredentials
    }

    // NOTE: the order of the plugins is reversed, so we end by adding the app plugin which is used by all other
    // plugins

    if (options.auth) {
      if (nuxt.options.ssr && !hasServiceAccount) {
        logger.warn(
          'You activated both SSR and auth but you are not providing a service account for the admin SDK. See https://vuefire.vuejs.org/nuxt/getting-started.html#configuring-the-admin-sdk.'
        )
      }

      if (options.appCheck) {
        addPlugin(resolve(runtimeDir, 'app-check/plugin.client'))
        // TODO: ensure this is the only necessary check. Maybe we need to check if server
        if (hasServiceAccount) {
          addPlugin(resolve(runtimeDir, 'app-check/plugin.server'))
        } else if (nuxt.options.ssr) {
          logger.warn(
            'You activated both SSR and app-check but you are not providing a service account for the admin SDK. See https://vuefire.vuejs.org/nuxt/getting-started.html#configuring-the-admin-sdk.'
          )
        }
      }

      // this adds the VueFire plugin and handle SSR state serialization and hydration
      addPluginTemplate({
        src: normalize(resolve(templatesDir, 'plugin.ejs')),

        options: {
          ...options,
          ssr: nuxt.options.ssr,
        },
      })

      if (options.auth && nuxt.options.ssr && hasServiceAccount) {
        // Add the session handler than mints a cookie for the user
        addServerHandler({
          route: '/api/__session',
          handler: resolve(runtimeDir, './auth/api.session-verification'),
        })

        // must be added after (which means before in code) the plugin module
        addPlugin(resolve(runtimeDir, 'auth/plugin-mint-cookie.client'))
      }

      // hydrates the user if any
      addPlugin(resolve(runtimeDir, 'auth/plugin.client'))
      // loads the user on the current app
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

    // Emulators must be enabled after the app is initialized but before some APIs like auth.signinWithCustomToken() are called
    if (
      // Disable emulators on production unless the user explicitly enables them
      (process.env.NODE_ENV !== 'production' ||
        process.env.VUEFIRE_EMULATORS) &&
      options.emulators
    ) {
      const emulators = await detectEmulators(
        options,
        resolve(nuxt.options.rootDir, 'firebase.json'),
        logger
      )

      // expose the detected emulators to the plugins
      nuxt.options.runtimeConfig.public.vuefire ??= {}
      nuxt.options.runtimeConfig.public.vuefire.emulators = emulators

      for (const serviceName in emulators) {
        const { host, port } = emulators[serviceName as keyof typeof emulators]
        // set the env variables so they are picked up automatically by the admin SDK
        process.env[
          serviceName === 'firestore'
            ? 'FIRESTORE_EMULATOR_HOST'
            : `FIREBASE_${serviceName.toUpperCase()}_EMULATOR_HOST`
        ] = `${host}:${port}`
        logger.info(`Enabling ${serviceName} emulator at ${host}:${port}`)
        addPlugin(resolve(runtimeDir, `emulators/${serviceName}.plugin`))
      }
    }

    // adds the firebase app to each application
    addPlugin(resolve(runtimeDir, 'app/plugin.client'))
    addPlugin(resolve(runtimeDir, 'app/plugin.server'))

    // we start the admin app before the regular app so we can have access to the user uid everywhere
    if (options.admin || nuxt.options.ssr) {
      if (!nuxt.options.ssr) {
        logger.warn(
          'The "admin" option is only used during SSR. You should reenable SSR to use it or remove it if you are not doing SSR or SSG.'
        )
      }

      if (hasServiceAccount) {
        if (options.auth) {
          // decodes user token from cookie if any
          addPlugin(resolve(runtimeDir, 'auth/plugin-user-token.server'))
        }

        if (options.admin?.options) {
          // used by the admin app plugin to initialize the admin app
          nuxt.options.runtimeConfig.vuefireAdminOptions = options.admin.options
        }
        // injects firebaseAdminApp
        addPlugin(resolve(runtimeDir, 'admin/plugin.server'))
      }
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
  },

  // workaround for vite
  hooks: {
    'vite:extendConfig': (viteInlineConfig, env) => {
      viteInlineConfig.resolve ??= {}
      viteInlineConfig.resolve.dedupe ??= []
      const deps = [
        // 'vuefire',
        // 'nuxt-vuefire',
        'firebase',
        'firebase/app',
        '@firebase/app',
        'firebase/firestore',
        '@firebase/firestore',
        'firebase/auth',
        '@firebase/auth',
        '@firebase/component',
        'firebase-admin/auth',
        'firebase-admin/app',
        'firebase-admin/app-check',
      ]
      viteInlineConfig.resolve.dedupe.push(...deps)

      viteInlineConfig.optimizeDeps ??= {}
      viteInlineConfig.optimizeDeps.exclude ??= []
      viteInlineConfig.optimizeDeps.exclude.push(...deps)
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

export type {
  NuxtVueFireAppCheckOptions,
  NuxtVueFireAppCheckOptionsReCaptchaV3,
  NuxtVueFireAppCheckOptionsReCaptchaEnterprise,
} from './runtime/app-check'

/**
 * Type Extensions
 */

/**
 * Augments the Nuxt Runtime Config with the VueFire module options.
 */
interface VueFireRuntimeConfig {
  /**
   * Firebase Admin options passed to VueFire module. Only available on the server.
   *
   * @internal
   */
  vuefireAdminOptions?: Omit<AppOptions, 'credential'>
}

interface VueFirePublicRuntimeConfig {
  vuefire?: {
    /**
     * Emulators to enable.
     *
     * @internal
     */
    emulators?: FirebaseEmulatorsToEnable
  }
}

interface VueFireAppConfig {
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
}

declare module '@nuxt/schema' {
  export interface AppConfig extends VueFireAppConfig {}
  export interface RuntimeConfig extends VueFireRuntimeConfig {}
  export interface PublicRuntimeConfig extends VueFirePublicRuntimeConfig {}
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
