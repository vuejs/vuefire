import { FirebaseApp } from 'firebase/app'
import { getAuth, onIdTokenChanged, User } from 'firebase/auth'
import { inject, InjectionKey, Ref } from 'vue'

export const AuthUserInjectSymbol: InjectionKey<Ref<User | null | undefined>> =
  Symbol('user')

/**
 * Returns a shallowRef of the currently authenticated user in the firebase app. The ref is null if no user is
 * authenticated or when the user logs out. The ref is undefined when the user is not yet loaded.
 */
export function useCurrentUser() {
  // TODO: warn no current instance
  return inject(AuthUserInjectSymbol)!
}

export function setupOnAuthStateChanged(
  user: Ref<User | null | undefined>,
  app?: FirebaseApp
) {
  const auth = getAuth(app)
  let resolve!: (value: User | null) => void
  const isReady = new Promise((_resolve) => {
    resolve = _resolve
  })

  // onAuthStateChanged doesn't trigger in all scenarios like when the user goes links an existing account and their
  // data is updated
  // https://github.com/firebase/firebase-js-sdk/issues/4227
  onIdTokenChanged(auth, (userData) => {
    user.value = userData
    resolve(userData)
  })

  return { isReady }
}
