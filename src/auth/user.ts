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
import type { Ref } from 'vue-demi'
import { useFirebaseApp } from '../app'
import type { _MaybeRef, _Nullable } from '../shared'

/**
 * Maps an application to a user
 * @internal
 */
export const authUserMap = new WeakMap<FirebaseApp, Ref<_Nullable<User>>>()

/**
 * Returns a reactive variable of the currently authenticated user in the firebase app. The ref is null if no user is
 * authenticated or when the user logs out. The ref is undefined when the user is not yet loaded. Note th
 * @param name - name of the application
 */
export function useCurrentUser(name?: string) {
  // TODO: write a test
  if (
    process.env.NODE_ENV !== 'production' &&
    !authUserMap.has(useFirebaseApp(name))
  ) {
    throw new Error(
      `[VueFire] useCurrentUser() called before the VueFireAuth module was added to the VueFire plugin. This will fail in production.`
    )
  }
  return authUserMap.get(useFirebaseApp())!
}

/**
 * Updates the current user profile and updates the current user state. This function internally calls `updateProfile()`
 * from 'firebase/auth' and then updates the current user state.
 *
 * @param user - the user to update
 * @param profile - the new profile information
 */
export function updateCurrentUserProfile(profile: {
  displayName?: _Nullable<string>
  photoURL?: _Nullable<string>
}) {
  return getCurrentUser().then((user) => {
    if (user) {
      return updateProfile(user, profile).then(() => user.reload())
    }
  })
}

/**
 * Updates the current user and synchronizes the current user state. This function internally calls `updateEmail()`
 *
 * @experimental
 *
 * @param newEmail - the new email address
 * @param credential -
 */
export function updateCurrentUserEmail(
  newEmail: string,
  credential: AuthCredential
) {
  return getCurrentUser()
    .then((user) => {
      if (user) {
        // TODO: Maybe this whole function should be dropped since it depends on re-authenticating first or we should
        // let the user do it. Otherwise, we need a way to retrieve the credential token when logging in
        reauthenticateWithCredential(user, credential)
      }
      return user
    })
    .then((user) => {
      if (user) {
        return updateEmail(user, newEmail).then(() => {
          // @ts-expect-error: readonly property
          user.email = newEmail
        })
      }
    })
}

// @internal
type _UserState =
  // state 1 waiting for the initial load
  | [Promise<_Nullable<User>>, (user: Ref<_Nullable<User>>) => void]
  // state 2 loaded
  | Ref<_Nullable<User>>

const initialUserMap = new WeakMap<FirebaseApp, _UserState>()

// TODO: add firebase app name?
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
