import { initializeApp } from 'firebase/app'
import { defineNuxtPlugin, useAppConfig } from '#app'

/**
 * Initializes the app and provides it to others.
 */

export default defineNuxtPlugin(() => {
  const appConfig = useAppConfig()

  const firebaseApp = initializeApp(appConfig.firebaseConfig)

  return {
    provide: {
      firebaseApp,
    },
  }
})
