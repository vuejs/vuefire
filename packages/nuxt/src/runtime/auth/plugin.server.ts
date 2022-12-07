import type { FirebaseApp } from '@firebase/app-types'
import type { App as AdminApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import {
  getAuth,
  onIdTokenChanged,
  signInWithCredential,
  AuthCredential,
} from 'firebase/auth'
import { getCurrentUser, VueFireAuth } from 'vuefire'
import { getCookie } from 'h3'
import { AUTH_COOKIE_NAME } from './api.session'
import { defineNuxtPlugin, useRequestEvent } from '#app'

/**
 * Setups the auth state based on the cookie.
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  const event = useRequestEvent()
  const token = getCookie(event, AUTH_COOKIE_NAME)

  if (token) {
    const adminApp = nuxtApp.$adminApp as AdminApp
    const auth = getAdminAuth(adminApp)

    const decodedToken = await auth.verifyIdToken(token)
    const user = await auth.getUser(decodedToken.uid)

    // signInWithCredential(getAuth(firebaseApp)))

    console.log('🔥 setting user', user)

    // provide user
  }
})
