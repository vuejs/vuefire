import type { FirebaseApp } from 'firebase/app'
import type { User } from 'firebase/auth'
import { VueFireAuthServer } from 'vuefire/server'
import type { App } from 'vue'
import { UserSymbol } from '../constants'
import { log } from '../logging'
import { defineNuxtPlugin } from '#app'

/**
 * Setups the auth state based on the cookie.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp
  const user = nuxtApp[
    // we cannot use symbol to index
    UserSymbol as unknown as string
  ] as User | undefined | null

  // log('debug', 'setting up user for app', firebaseApp.name, user?.uid)

  // provide the user data to the app during ssr
  VueFireAuthServer(firebaseApp, nuxtApp.vueApp as App, user)
})
