import { FirebaseApp } from 'firebase/app'
import { getAuth, User } from 'firebase/auth'
import { App, shallowRef } from 'vue'
import { useFirebaseApp } from '../app'
import { getGlobalScope } from '../globals'
import { AuthUserInjectSymbol, setupOnAuthStateChanged } from './user'

export { setupOnAuthStateChanged, useCurrentUser } from './user'

export function VueFireAuth(_app?: never) {
  // TODO: refactor to share across modules
  if (process.env.NODE_ENV !== 'production') {
    if (_app != null) {
      console.warn(`Did you forget to call the VueFireAuth function? It should look like
modules: [VueFireAuth()]`)
    }
  }

  return (firebaseApp: FirebaseApp, app: App) => {
    const user = getGlobalScope(firebaseApp, app).run(() =>
      shallowRef<User | null | undefined>()
    )!
    // userMap.set(app, user)
    app.provide(AuthUserInjectSymbol, user)
    setupOnAuthStateChanged(user, firebaseApp)
  }
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
