import { initializeApp } from 'firebase/app'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

/**
 * Initializes the app and provides it to others.
 */
export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()

  // NOTE: the presence of the config is ensured by the module
  const firebaseApp = initializeApp(runtimeConfig.public.vuefire!.config!)

  return {
    provide: {
      firebaseApp,
    },
  }
})
