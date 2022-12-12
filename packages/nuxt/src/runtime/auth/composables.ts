import { getCurrentUser as _getCurrentUser } from 'vuefire'
import { useFirebaseApp } from '../app/composables'

/**
 * @inheritDoc {getCurrentUser}
 */
export const getCurrentUser = (name?: string) =>
  // This makes the `getCurrentUser()` function work by default in more places when using the Nuxt module
  _getCurrentUser(name ?? useFirebaseApp().name)
