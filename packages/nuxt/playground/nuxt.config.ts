import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'
import VueFire from '../'

export default defineNuxtConfig({
  app: {
    pageTransition: false,
    layoutTransition: false,
  },

  alias: {
    vuefire: fileURLToPath(new URL('../../../src/index.ts', import.meta.url)),
    'nuxt-vuefire': fileURLToPath(new URL('../src/module.ts', import.meta.url)),
  },

  modules: [
    //
    [
      VueFire,
      {
        services: {
          auth: true,
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
      },
    ],
  ],
})
