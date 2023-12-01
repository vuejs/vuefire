import type { FirebaseApp } from 'firebase/app'
import {
  type Dependencies as AuthDependencies,
  initializeAuth,
  type User,
  browserPopupRedirectResolver,
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  Auth,
} from 'firebase/auth'
import { type App, ref, inject } from 'vue-demi'
import { useFirebaseApp } from '../app'
import { getGlobalScope } from '../globals'
import { isClient, _Nullable } from '../shared'
import { authUserMap, setupOnAuthStateChanged } from './user'
import { type VueFireModule } from '..'

export {
  useCurrentUser,
  useIsCurrentUserLoaded,
  getCurrentUser,
  updateCurrentUserProfile,
  updateCurrentUserEmail,
} from './user'

/**
 * Options for VueFire Auth module.
 */
export interface VueFireAuthOptions {
  /**
   * Initial value of the user. Used during SSR.
   */
  initialUser?: _Nullable<User>

  /**
   * Options to pass to `initializeAuth()`.
   */
  dependencies: AuthDependencies
}

/**
 * VueFire Auth Module to be added to the `VueFire` Vue plugin options. This calls the `VueFireAuthWithDependencies()`
 * with **all** the dependencies, increasing bundle size. Consider using `VueFireAuthWithDependencies()` instead to
 * better control the bundle size.
 *
 * @see https://firebase.google.com/docs/auth/web/custom-dependencies
 *
 * @example
 *
 *```ts
 *import { createApp } from 'vue'
 *import { VueFire, VueFireAuth } from 'vuefire'
 *
 *const app = createApp(App)
 *app.use(VueFire, {
 *  modules: [VueFireAuth()],
 *})
 *```
 *
 * @param initialUser - initial value of the user. used for SSR
 */
export function VueFireAuth(initialUser?: _Nullable<User>): VueFireModule {
  return VueFireAuthWithDependencies({
    initialUser,
    dependencies: {
      popupRedirectResolver: browserPopupRedirectResolver,
      persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
      ],
    },
  })
}

/**
 * Key to be used to inject the auth instance into components. It allows avoiding to call `getAuth()`, which isn't tree
 * shakable.
 * @internal
 */
export const _VueFireAuthKey = Symbol('VueFireAuth')

/**
 * VueFire Auth Module to be added to the `VueFire` Vue plugin options. It accepts dependencies to pass to
 * `initializeAuth()` to better control the bundle size.
 *
 * @param options - user and options to pass to `initializeAuth()`.
 */
export function VueFireAuthWithDependencies({
  dependencies,
  initialUser,
}: VueFireAuthOptions): VueFireModule {
  return (firebaseApp: FirebaseApp, app: App) => {
    const [user, auth] = _VueFireAuthInit(
      firebaseApp,
      app,
      initialUser,
      dependencies
    )
    setupOnAuthStateChanged(user, auth)
  }
}

/**
 * initializes auth for both the server and client.
 * @internal
 */
export function _VueFireAuthInit(
  firebaseApp: FirebaseApp,
  app: App,
  initialUser: _Nullable<User>,
  dependencies: AuthDependencies
) {
  const user = getGlobalScope(firebaseApp, app).run(() =>
    ref<_Nullable<User>>(initialUser)
  )!
  // TODO: Is it okay to have it both server and client?
  authUserMap.set(firebaseApp, user)
  const auth = initializeAuth(firebaseApp, dependencies)
  app.provide(_VueFireAuthKey, auth)

  return [user, auth] as const
}

/**
 * Retrieves the Firebase Auth instance. **Returns `null` on the server**. When using this function on the client in
 * TypeScript, you can force the type with `useFirebaseAuth()!`.
 *
 * @param name - name of the application
 * @returns the Auth instance
 */
export function useFirebaseAuth(): Auth | null
/**
 * Retrieves the Firebase Auth instance. **Returns `null` on the server**. When using this function on the client in
 * TypeScript, you can force the type with `useFirebaseAuth()!`.
 *
 * @deprecated - the name parameter is removed to enable tree shaking. If you have multiple applications, you **must**
 * use "getAuth(firebaseApp)" or "getAuth(useFirebaseApp(name))" instead.`
 *
 * @param name - name of the application
 * @returns the Auth instance
 */
export function useFirebaseAuth(name?: string) {
  if (process.env.NODE_ENV !== 'production' && name != null) {
    console.warn(
      `[VueFire] useFirebaseAuth() no longer accepts a name parameter to enable tree shaking. If you have multiple applications, you must use "getAuth(firebaseApp)" or "getAuth(useFirebaseApp(name))" instead.`
    )
  }
  return isClient ? inject(_VueFireAuthKey) : null
}
