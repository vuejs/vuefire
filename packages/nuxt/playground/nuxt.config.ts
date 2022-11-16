import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'
import VueFire from '../'

export default defineNuxtConfig({
  pageTransition: null,
  layoutTransition: null,
  alias: {
    vuefire: fileURLToPath(new URL('../../../src/index.ts', import.meta.url)),
    'nuxt-vuefire': fileURLToPath(new URL('../src/module.ts', import.meta.url)),
  },
  modules: [
    //
    [VueFire, {}],
  ],
})
