import { usePendingPromises, VueFire, useSSRInitialState } from 'vuefire'
import { initializeApp } from 'firebase/app'
import { defineNuxtPlugin, useAppConfig } from '#imports'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectDatabaseEmulator, getDatabase } from 'firebase/database'

export default defineNuxtPlugin((nuxtApp) => {
  // TODO: initialize firebase app from config

  console.log('initializing firebase app')

  const firebaseApp = initializeApp({
    // FIXME: hard coded until the templates are fixed in nuxt
    apiKey: 'AIzaSyAkUKe36TPWL2eZTshgk-Xl4bY_R5SB97U',
    authDomain: 'vue-fire-store.firebaseapp.com',
    databaseURL: 'https://vue-fire-store.firebaseio.com',
    projectId: 'vue-fire-store',
    storageBucket: 'vue-fire-store.appspot.com',
    messagingSenderId: '998674887640',
    appId: '1:998674887640:web:1e2bb2cc3e5eb2fc3478ad',
    measurementId: 'G-RL4BTWXKJ7',
  })

  console.log('initialized app')

  // connectFirestoreEmulator(getFirestore(firebaseApp), 'localhost', 8080)
  // connectDatabaseEmulator(getDatabase(firebaseApp), 'localhost', 8081)

  nuxtApp.vueApp.use(VueFire, {
    firebaseApp,
  })

  if (process.server) {
    // TODO: pass the firebaseApp
    nuxtApp.payload.vuefire = useSSRInitialState(undefined, firebaseApp)
  } else if (nuxtApp.payload?.vuefire) {
    // hydrate the plugin state from nuxtApp.payload.vuefire
    useSSRInitialState(nuxtApp.payload.vuefire, firebaseApp)
  }
})
