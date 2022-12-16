import type { FirebaseApp } from 'firebase/app'
import type { User } from 'firebase/auth'
import { VueFireAuthServer } from 'vuefire/server'
import { UserSymbol } from '../admin/plugin-auth-user.server'
import { defineNuxtPlugin } from '#app'
import { log } from '../../logging'

/**
 * Setups the auth state based on the cookie.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp
  // @ts-expect-error: this is a private symbol
  const user = nuxtApp[UserSymbol] as User | undefined | null

  log('setting up user for app', firebaseApp.name, user?.uid)

  // provide the user data to the app during ssr
  VueFireAuthServer(firebaseApp, nuxtApp.vueApp, user)
})
