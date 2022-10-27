// https://v3.nuxtjs.org/api/configuration/nuxt.config
import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  pageTransition: null,
  layoutTransition: null,
  alias: {
    vuefire: fileURLToPath(new URL('../src/index.ts', import.meta.url)),
  },
})
