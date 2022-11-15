import { usePendingPromises, VueFire, useSSRInitialState } from 'vuefire'
import { initializeApp } from 'firebase/app'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
  // TODO: initialize firebase app from config
  const firebaseApp = initializeApp()

  nuxtApp.vueApp.use(
    // @ts-expect-error: nuxt type bug?
    VueFire,
    {
      firebaseApp,
    },
  )

  if (process.server) {
    await usePendingPromises()
    // TODO: pass the firebaseApp
    nuxtApp.payload.vuefire = useSSRInitialState()
  } else if (nuxtApp.payload?.vuefire) {
    // hydrate the plugin state from nuxtApp.payload.vuefire
    useSSRInitialState(nuxtApp.payload.vuefire)
  }

  return {
    provide: {
      // firebaseApp:
      // firestore
      // database
      // auth
    },
  }
})
