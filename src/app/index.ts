import { FirebaseApp, getApp } from 'firebase/app'
import { getCurrentScope, inject, InjectionKey } from 'vue'

// @internal
export const _FirebaseAppInjectionKey: InjectionKey<FirebaseApp> =
  Symbol('firebaseApp')

/**
 * Gets the application firebase app.
 *
 * @param name - optional firebase app name
 * @returns the firebase app
 */
export function useFirebaseApp(name?: string): FirebaseApp {
  // TODO: warn no current scope
  const firebaseApp: FirebaseApp =
    (getCurrentScope() &&
      inject(
        _FirebaseAppInjectionKey,
        // avoid the inject not found warning
        null
      )) ||
    getApp(name)
  return firebaseApp
}
