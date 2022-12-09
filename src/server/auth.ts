import { FirebaseApp } from 'firebase/app'
import { User } from 'firebase/auth'
import { UserRecord } from 'firebase-admin/auth'
import { App, ref } from 'vue'
import { authUserMap, _setInitialUser } from '../auth/user'
import { getGlobalScope } from '../globals'
import { _Nullable } from '../shared'

export function VueFireAuthServer(
  firebaseApp: FirebaseApp,
  app: App,
  userRecord: _Nullable<User>
) {
  const user = getGlobalScope(firebaseApp, app).run(() =>
    ref<_Nullable<User>>(userRecord)
  )!
  authUserMap.set(firebaseApp, user)
  _setInitialUser(firebaseApp, user)
}

/**
 * Creates a user object that is compatible with the client but will throw errors when its functions are used as they
 * shouldn't be called within in the server.
 *
 * @param userRecord - user data from firebase-admin
 */
export function createServerUser(
  userRecord: _Nullable<UserRecord>
): _Nullable<User> {
  if (!userRecord) return null
  const user = userRecord.toJSON() as UserRecord

  return {
    ...user,
    // these seem to be type mismatches within firebase source code
    tenantId: user.tenantId || null,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    email: user.email || null,
    phoneNumber: user.phoneNumber || null,

    delete: InvalidServerFunction('delete'),
    getIdToken: InvalidServerFunction('getIdToken'),
    getIdTokenResult: InvalidServerFunction('getIdTokenResult'),
    reload: InvalidServerFunction('reload'),
    toJSON: InvalidServerFunction('toJSON'),
    get isAnonymous() {
      return warnInvalidServerGetter('isAnonymous', false)
    },
    get refreshToken() {
      return warnInvalidServerGetter('refreshToken', '')
    },
    get providerId() {
      return warnInvalidServerGetter('providerId', '')
    },
  }
}

// function helpers to warn on wrong usage on server

/**
 * Creates a function that throws an error when called.
 *
 * @param name - name of the function
 */
function InvalidServerFunction(name: string) {
  return () => {
    throw new Error(
      `The function User.${name}() is not available on the server.`
    )
  }
}

/**
 * Creates a getter that warns when called and return a fallback value.
 *
 * @param name - name of the getter
 * @param value - value to return
 */

function warnInvalidServerGetter<T>(name: string, value: T) {
  console.warn(
    `The getter User.${name} is not available on the server. It will return ${String(
      value
    )}.`
  )
  return value
}
