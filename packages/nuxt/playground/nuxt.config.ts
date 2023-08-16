import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

export default defineNuxtConfig({
  app: {
    pageTransition: false,
    layoutTransition: false,
  },

  devtools: {
    enabled: true,
  },

  nitro: {
    preset: fileURLToPath(new URL('./preset', import.meta.url)),
    // preset: 'nitro-preset-firebase',
    runtimeConfig: {
      firebase: {
        functions: {
          httpsOptions: {
            region: 'europe-west1',
          },
        },
      },
    },
  },

  alias: {
    // import the dev version directly
    'vuefire/server': fileURLToPath(
      new URL('../../../src/server/index.ts', import.meta.url)
    ),
    'vuefire/*': fileURLToPath(new URL('../../../src/*', import.meta.url)),
    vuefire: fileURLToPath(new URL('../../../src/index.ts', import.meta.url)),
  },

  modules: [
    //
    [
      '../src/module',
      {
        auth: true,
        appCheck: {
          // TODO: could automatically pick up a debug token defined as an env variable
          debug: process.env.NODE_ENV !== 'production',
          isTokenAutoRefreshEnabled: true,
          provider: 'ReCaptchaV3',
          key: '6LfJ0vgiAAAAAHheQE7GQVdG_c9m8xipBESx_SKI',
        },

        emulators: {
          enabled: true,

          auth: {
            options: {
              // removes the HTML footer and console warning
              disableWarnings: process.env.NODE_ENV === 'development',
            },
          },
        },

        config: {
          apiKey: 'AIzaSyAkUKe36TPWL2eZTshgk-Xl4bY_R5SB97U',
          authDomain: 'vue-fire-store.firebaseapp.com',
          databaseURL: 'https://vue-fire-store.firebaseio.com',
          projectId: 'vue-fire-store',
          storageBucket: 'vue-fire-store.appspot.com',
          messagingSenderId: '998674887640',
          appId: '1:998674887640:web:1e2bb2cc3e5eb2fc3478ad',
          measurementId: 'G-RL4BTWXKJ7',
        },

        // admin: {},
      },
    ],
  ],
})
