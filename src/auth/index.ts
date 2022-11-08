import { FirebaseApp } from 'firebase/app'
import { getAuth, User } from 'firebase/auth'
import { App, shallowRef } from 'vue'
import { useFirebaseApp } from '../app'
import { scope } from '../globals'
import { AuthUserInjectSymbol, setupOnAuthStateChanged } from './user'

export { setupOnAuthStateChanged, useCurrentUser } from './user'

// TODO: figure out a way, could be related to adding a new API to Vue that allows library authors to set the active app and therefore allow top level injcections
// const userMap = new WeakMap<FirebaseApp, Ref<User | null | undefined>>()

export function VueFireAuth(firebaseApp: FirebaseApp | undefined, app: App) {
  const user = scope.run(() => shallowRef<User | null | undefined>())!
  // userMap.set(app, user)
  app.provide(AuthUserInjectSymbol, user)
  setupOnAuthStateChanged(user, firebaseApp)
}

/**
 * Retrieves the Firebase Auth instance.
 *
 * @param name - name of the application
 * @returns the Auth instance
 */
export function useFirebaseAuth(name?: string) {
  return getAuth(useFirebaseApp(name))
}
