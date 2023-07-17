import type { FirebaseApp } from 'firebase/app'
import type { User } from 'firebase/auth'
import type { DecodedIdToken, UserRecord } from 'firebase-admin/auth'
import { App, ref } from 'vue'
import { authUserMap, _setInitialUser } from '../auth/user'
import { getGlobalScope } from '../globals'
import { type _Nullable } from '../shared'
import type { App as AdminApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import { logger } from './logging'
import { isFirebaseError } from './utils'

// MUST be named `__session` to be kept in Firebase context, therefore this name is hardcoded
// https://firebase.google.com/docs/hosting/manage-cache#using_cookies
export const AUTH_COOKIE_NAME = '__session'

/**
 * Initializes the auth related data on the server.
 * @experimental This API is experimental and may change in future releases.
 */
export function VueFireAuthServer(
  firebaseApp: FirebaseApp,
  app: App<unknown>,
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

/**
 * Verifies a cookie token and returns the corresponding decoded token or null if the token is invalid or inexistent.
 * This token contains the user's uid.
 *
 * @param sessionCookie - token parsed from the cookie
 * @param adminApp - Firebase Admin App
 */
export async function decodeSessionCookie(
  sessionCookie: string | undefined,
  adminApp: AdminApp
): Promise<DecodedIdToken | null> {
  if (sessionCookie) {
    const adminAuth = getAdminAuth(adminApp)

    try {
      // TODO: should we check for the revoked status of the token here?
      // we await to try/catch
      // return await adminAuth.verifyIdToken(token /*, checkRevoked */)
      return await adminAuth.verifySessionCookie(
        sessionCookie
        /** checkRevoked */
      )
    } catch (err) {
      // TODO: some errors should probably go higher
      // ignore the error and consider the user as not logged in
      if (isFirebaseError(err) && err.code === 'auth/id-token-expired') {
        // Other errors to be handled: auth/argument-error
        // the error is fine, the user is not logged in
        logger.info('Token expired, client must revalidate')
        // TODO: this error should be accessible somewhere to instruct the user to renew their access token
      } else {
        // ignore the error and consider the user as not logged in
        logger.error('Unknown Error verifying session cookie', err)
      }
    }
  }

  return null
}

/**
 * @deprecated Use `decodeSessionCookie` instead.
 */
export const decodeUserToken = decodeSessionCookie
