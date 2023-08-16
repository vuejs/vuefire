import type { FirebaseApp } from 'firebase/app'
import { isSupported, initializeAnalytics } from 'firebase/analytics'
import { defineNuxtPlugin, useAppConfig } from '#app'

/**
 * Plugin to initialize the analytics module.
 * @experimental: NOT YET RELEASED
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const appConfig = useAppConfig()
  // @ts-expect-error: not implemented yet
  const options = appConfig.vuefireOptions.analytics
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  if (await isSupported()) {
    initializeAnalytics(firebaseApp, options)
  } else {
    console.info(
      '[nuxt-vuefire]: Firebase Analytics is not supported on this platform.'
    )
  }
})
