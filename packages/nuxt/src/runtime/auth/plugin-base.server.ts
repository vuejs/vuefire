import type { FirebaseApp } from 'firebase/app'
import { debugErrorMap, prodErrorMap, type User } from 'firebase/auth'
import { _VueFireAuthInit } from 'vuefire'
import { defineNuxtPlugin } from '#imports'

/**
 * Setups VueFireAuth for the client. This version creates some listeners that shouldn't be set on server.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  const [_user, auth] = _VueFireAuthInit(
    firebaseApp,
    nuxtApp.vueApp,
    nuxtApp.payload.vuefireUser as User | undefined,
    {
      errorMap:
        process.env.NODE_ENV === 'production' ? prodErrorMap : debugErrorMap,
    }
  )

  return {
    provide: {
      firebaseAuth: auth,
    },
  }
})
