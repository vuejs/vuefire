import { getCurrentUser as _getCurrentUser } from 'vuefire'
import { useNuxtApp } from '#app'

/**
 * @inheritDoc {getCurrentUser}
 */
export function getCurrentUser(name?: string) {
  // This makes the `getCurrentUser()` function work by default in more places when using the Nuxt module
  return _getCurrentUser(name ?? useNuxtApp().$firebaseApp.name)
}
