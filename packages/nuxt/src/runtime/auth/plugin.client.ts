import type { FirebaseApp } from 'firebase/app'
import type { User } from 'firebase/auth'
import { VueFireAuth } from 'vuefire'
import { defineNuxtPlugin } from '#imports'

/**
 * Setups VueFireAuth for the client. This version creates some listeners that shouldn't be set on server.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  VueFireAuth(nuxtApp.payload.vuefireUser as User | undefined)(
    firebaseApp,
    nuxtApp.vueApp
  )
})
