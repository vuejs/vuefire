/**
 * @module nuxt-vuefire
 */
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
import type { FirebaseApp, FirebaseOptions } from 'firebase/app'
import type { App as FirebaseAdminApp } from 'firebase-admin/app'
import { markRaw } from 'vue'
import { consola } from 'consola'
import {
  VueFireNuxtModuleOptions,
  VueFireNuxtModuleOptionsResolved,
} from './module/options'
import {
  FirebaseEmulatorsToEnable,
  detectEmulators,
  willUseEmulators,
} from './module/emulators'

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
    emulators: { enabled: true },
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

    // TODO: I don't think the appConfig is the right place to store these as it makes things reactive
    // Let plugins and the user access the firebase config within the app
    nuxt.options.appConfig.firebaseConfig = markRaw(options.config)
    nuxt.options.appConfig.vuefireOptions = markRaw(options)

    nuxt.options.runtimeConfig.vuefire = {
      options: {
        ...options,
        // ensure the resolved version easier to consume
        emulators: {
          enabled:
            typeof options.emulators === 'object'
              ? options.emulators.enabled ?? true // allows user to comment out enabled: false
              : !!options.emulators,
          ...(typeof options.emulators === 'object' ? options.emulators : {}),
        },
      },
    }

    // we need this to avoid some warnings about missing credentials and ssr
    const emulatorsConfig = await willUseEmulators(
      nuxt.options.runtimeConfig.vuefire.options!,
      resolve(nuxt.options.rootDir, 'firebase.json'),
      logger
    )

    // to handle TimeStamp and GeoPoints objects
    addPlugin(resolve(runtimeDir, 'payload-plugin'))

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

    if (options.appCheck) {
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && emulatorsConfig) {
        logger.info(
          'Disabling App Check in the context of emulators as no "GOOGLE_APPLICATION_CREDENTIALS" env variable was defined.'
        )
      } else {
        if (
          process.env.FIREBASE_APPCHECK_DEBUG_TOKEN &&
          // only use the debug token if the user explicitly set debug to true or if nothing was provided and we are not in production
          (options.appCheck.debug === true ||
            // allow a manual override from the console before bundling
            process.env.VUEFIRE_APPCHECK_DEBUG ||
            (options.appCheck.debug == null &&
              process.env.NODE_ENV !== 'production'))
        ) {
          logger.debug(
            `Using app check debug token from env variable "${process.env.FIREBASE_APPCHECK_DEBUG_TOKEN}"`
          )
          if (process.env.NODE_ENV === 'production' && options.appCheck.debug) {
            logger.warn(
              'You are using a debug token in production, DO NOT DEPLOY THIS BUILD. If you do, you will leak your debug app check token.'
            )
          }
          options.appCheck.debug = process.env.FIREBASE_APPCHECK_DEBUG_TOKEN
        } else if (emulatorsConfig) {
          logger.debug('Detected Emulators environment, using debug App Check')
          options.appCheck.debug ??= true
        }

        addPlugin(resolve(runtimeDir, 'app-check/plugin.client'))
        // TODO: With emulators a different plugin should be used, one that doesn't instantiate app check as it will error on the server anyway
        if (hasServiceAccount || emulatorsConfig) {
          // this is needed by the api endpoint to properly work if no service account is provided, otherwise, the projectId is within the service account
          addPlugin(resolve(runtimeDir, 'app-check/plugin.server'))
        } else if (nuxt.options.ssr && !emulatorsConfig) {
          logger.warn(
            'You activated both SSR and app-check but you are not providing a service account for the admin SDK. See https://vuefire.vuejs.org/nuxt/getting-started.html#configuring-the-admin-sdk.'
          )
        }
      }
    }

    if (options.auth) {
      if (nuxt.options.ssr && !hasServiceAccount && !emulatorsConfig) {
        logger.warn(
          'You activated both SSR and auth but you are not providing a service account for the admin SDK. See https://vuefire.vuejs.org/nuxt/getting-started.html#configuring-the-admin-sdk.'
        )
      }

      // this adds the VueFire plugin and handle SSR state serialization and hydration
      addPluginTemplate({
        src: normalize(resolve(templatesDir, 'plugin.ejs')),

        options: {
          ...options,
          ssr: nuxt.options.ssr,
        },
      })

      if (
        options.auth &&
        nuxt.options.ssr &&
        (hasServiceAccount || emulatorsConfig)
      ) {
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

    if (emulatorsConfig) {
      const emulators = detectEmulators(
        nuxt.options.runtimeConfig.vuefire.options!,
        emulatorsConfig,
        logger
      )
      // add the option to disable the warning. It only exists in Auth
      if (emulators?.auth) {
        emulators.auth.options =
          nuxt.options.runtimeConfig.vuefire.options?.emulators?.auth?.options
      }

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

      if (hasServiceAccount || emulatorsConfig) {
        if (options.auth) {
          // decodes user token from cookie if any
          addPlugin(resolve(runtimeDir, 'auth/plugin-user-token.server'))
        }

        // injects firebaseAdminApp
        addPlugin(resolve(runtimeDir, 'admin/plugin.server'))

        // We need the projectId to be explicitly set for the admin SDK to work
        if (emulatorsConfig) {
          options.admin ??= {}
          options.admin.options ??= {}
          options.admin.options.projectId ??= options.config.projectId
        }
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
   * Runtime config for the VueFire module.
   */
  vuefire?: {
    /**
     * Options passed to the Nuxt VueFire module
     * @internal
     */
    options?: VueFireNuxtModuleOptionsResolved
  }
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
