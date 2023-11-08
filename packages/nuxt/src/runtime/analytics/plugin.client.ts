import type { FirebaseApp } from 'firebase/app'
import { isSupported, initializeAnalytics } from 'firebase/analytics'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

/**
 * Plugin to initialize the analytics module.
 * @experimental: NOT YET RELEASED
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  // @ts-expect-error: not implemented yet, needs to be added to the type
  const options = runtimeConfig.public.vuefire.analytics
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  if (await isSupported()) {
    initializeAnalytics(firebaseApp, options)
  } else {
    console.info(
      '[nuxt-vuefire]: Firebase Analytics is not supported on this platform.'
    )
  }
})
