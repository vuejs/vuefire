import { usePendingPromises, VueFire, useSSRInitialState } from 'vuefire'
import { initializeApp } from 'firebase/app'
import { defineNuxtPlugin, useAppConfig } from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
  // TODO: initialize firebase app from config
  console.log('appconfig', useAppConfig())
  const firebaseApp = initializeApp()

  nuxtApp.vueApp.use(
    // @ts-expect-error: nuxt type bug?
    VueFire,
    {
      firebaseApp,
    }
  )

  if (process.server) {
    // TODO: pass the firebaseApp
    nuxtApp.payload.vuefire = useSSRInitialState(undefined, firebaseApp)
  } else if (nuxtApp.payload?.vuefire) {
    // hydrate the plugin state from nuxtApp.payload.vuefire
    useSSRInitialState(nuxtApp.payload.vuefire, firebaseApp)
  }

  return {}
})
