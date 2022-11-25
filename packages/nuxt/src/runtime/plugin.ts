import { usePendingPromises, VueFire, useSSRInitialState } from 'vuefire'
import { initializeApp } from 'firebase/app'
import { defineNuxtPlugin, useAppConfig } from '#app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectDatabaseEmulator, getDatabase } from 'firebase/database'

export default defineNuxtPlugin((nuxtApp) => {
  // TODO: initialize firebase app from config
  const appConfig = useAppConfig()

  console.log('initializing firebase app')

  const firebaseApp = initializeApp(appConfig.firebaseConfig)

  console.log('initialized app')

  // TODO: if emulator
  // connectFirestoreEmulator(getFirestore(firebaseApp), 'localhost', 8080)
  // connectDatabaseEmulator(getDatabase(firebaseApp), 'localhost', 8081)

  nuxtApp.vueApp.use(VueFire, {
    firebaseApp,
    modules: [
      // TODO: conditionally add modules (template)
      // VueFireAuth(),
      // VueFireAppCheck({
      //   // debug: process.env.NODE_ENV !== 'production',
      //   isTokenAutoRefreshEnabled: true,
      //   provider: new ReCaptchaV3Provider(
      //     '6LfJ0vgiAAAAAHheQE7GQVdG_c9m8xipBESx_SKI'
      //   ),
      // }),
      // VueFireDatabaseOptionsAPI(),
      // VueFireFirestoreOptionsAPI(),
    ],
  })

  if (process.server) {
    // TODO: pass the firebaseApp
    nuxtApp.payload.vuefire = useSSRInitialState(undefined, firebaseApp)
  } else if (nuxtApp.payload?.vuefire) {
    // hydrate the plugin state from nuxtApp.payload.vuefire
    useSSRInitialState(nuxtApp.payload.vuefire, firebaseApp)
  }
})
