import type { FirebaseApp } from 'firebase/app'
import {
  getAuth,
  onIdTokenChanged,
  User,
  updateEmail,
  updateProfile,
  reauthenticateWithCredential,
  AuthCredential,
} from 'firebase/auth'
import { inject, InjectionKey, Ref } from 'vue-demi'
import { useFirebaseApp } from '../app'
import type { _Nullable } from '../shared'

export const AuthUserInjectSymbol: InjectionKey<Ref<User | null | undefined>> =
  Symbol('user')

/**
 * Returns a shallowRef of the currently authenticated user in the firebase app. The ref is null if no user is
 * authenticated or when the user logs out. The ref is undefined when the user is not yet loaded.
 */
export function useCurrentUser() {
  // TODO: warn no current instance in DEV
  return inject(AuthUserInjectSymbol)!
}

// @internal
type _UserState =
  // state 1 waiting for the initial load
  | [Promise<_Nullable<User>>, (user: Ref<_Nullable<User>>) => void]
  // state 2 loaded
  | Ref<_Nullable<User>>

const initialUserMap = new WeakMap<FirebaseApp, _UserState>()

// @internal
function _getCurrentUserState() {
  const firebaseApp = useFirebaseApp()
  if (!initialUserMap.has(firebaseApp)) {
    let resolve!: (resolvedUser: _Nullable<User>) => void
    const promise = new Promise<_Nullable<User>>((_resolve) => {
      resolve = _resolve
    })

    const userState: _UserState = [
      promise,
      (user: Ref<_Nullable<User>>) => {
        initialUserMap.set(firebaseApp, user)
        // resolve the actual promise
        resolve(user.value)
      },
    ]

    initialUserMap.set(firebaseApp, userState)
  }

  return initialUserMap.get(firebaseApp)!
}

/**
 * Returns a promise that resolves the current user once the user is loaded. Must be called after the firebase app is
 * initialized.
 */
export function getCurrentUser(): Promise<_Nullable<User>> {
  const userOrPromise = _getCurrentUserState()

  return Array.isArray(userOrPromise)
    ? userOrPromise[0]
    : Promise.resolve(userOrPromise.value)
}

export function setupOnAuthStateChanged(
  user: Ref<_Nullable<User>>,
  app?: FirebaseApp
) {
  const auth = getAuth(app)

  // onAuthStateChanged doesn't trigger in all scenarios like when the user goes links an existing account and their
  // data is updated
  // https://github.com/firebase/firebase-js-sdk/issues/4227
  onIdTokenChanged(auth, (userData) => {
    const userOrPromise = _getCurrentUserState()
    user.value = userData
    // setup the initial user
    // afterwards, this will never be an array
    if (Array.isArray(userOrPromise)) {
      userOrPromise[1](user)
    }
  })
}
