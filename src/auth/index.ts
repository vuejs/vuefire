import type { FirebaseApp } from 'firebase/app'
import { getAuth, User } from 'firebase/auth'
import { App, ref } from 'vue-demi'
import { useFirebaseApp } from '../app'
import { getGlobalScope } from '../globals'
import { isClient, _Nullable } from '../shared'
import { _connectAuthEmulator, authUserMap, setupOnAuthStateChanged } from "./user"

export {
  useCurrentUser,
  useIsCurrentUserLoaded,
  getCurrentUser,
  updateCurrentUserProfile,
  updateCurrentUserEmail,
} from './user'

/**
 * VueFire Auth Module to be added to the `VueFire` Vue plugin options.
 *
 * @example
 *
 * ```ts
 * import { createApp } from 'vue'
 * import { VueFire, VueFireAuth } from 'vuefire'
 *
 * const app = createApp(App)
 * app.use(VueFire, {
 *   modules: [VueFireAuth()],
 * })
 * ```
 */
export function VueFireAuth(initialUser?: _Nullable<User>) {
  return (firebaseApp: FirebaseApp, app: App) => {
    const user = getGlobalScope(firebaseApp, app).run(() =>
      ref<_Nullable<User>>(initialUser)
    )!
    // this should only be on client
    authUserMap.set(firebaseApp, user)
    setupOnAuthStateChanged(user, firebaseApp)
  }
}

/**
 * Retrieves the Firebase Auth instance. **Returns `null` on the server**. When using this function on the client in
 * TypeScript, you can force the type with `useFirebaseAuth()!`.
 *
 * @param name - name of the application
 * @returns the Auth instance
 */
export function useFirebaseAuth(name?: string) {
  if (!isClient) return null

  const auth = getAuth(useFirebaseApp(name))
  _connectAuthEmulator(auth)

  return auth
}
