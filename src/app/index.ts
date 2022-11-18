import { FirebaseApp, getApp } from 'firebase/app'
import {
  getCurrentInstance,
  getCurrentScope,
  inject,
  InjectionKey,
} from 'vue-demi'

// @internal
export const _FirebaseAppInjectionKey: InjectionKey<FirebaseApp> =
  Symbol('firebaseApp')

/**
 * Gets the firebase app instance.
 *
 * @param name - optional firebase app name
 * @returns the firebase app
 */
export function useFirebaseApp(name?: string): FirebaseApp {
  return (
    (getCurrentInstance() &&
      inject(
        _FirebaseAppInjectionKey,
        // avoid the inject not found warning
        null
      )) ||
    getApp(name)
  )
}
