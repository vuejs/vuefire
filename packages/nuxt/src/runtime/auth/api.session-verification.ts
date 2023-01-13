import { getApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import {
  readBody,
  setCookie,
  assertMethod,
  defineEventHandler,
  deleteCookie,
} from 'h3'
import { log } from '../logging'
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from '../shared'

// This version is used at https://github.com/FirebaseExtended/firebase-framework-tools/blob/e69f5bdd44695274ad88dbb4e21aac778ba60cc8/src/firebase-aware.ts#L39 but doesn't work locally. Should it maybe be used in production only? Seems unlikely.

/**
 * Setups an API endpoint to be used by the client to mint a cookie based auth session.
 */
export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')
  const { token } = await readBody(event)

  log('minting a session cookie')
  const adminApp = getApp()
  const adminAuth = getAdminAuth(adminApp)

  log('read idToken from Authorization header', token)
  const verifiedIdToken = token ? await adminAuth.verifyIdToken(token) : null

  if (verifiedIdToken) {
    if (
      new Date().getTime() / 1_000 - verifiedIdToken.auth_time >
      ID_TOKEN_MAX_AGE
    ) {
      event.node.res.statusCode = 301
      return ''
    } else {
      const cookie = await adminAuth
        .createSessionCookie(token!, { expiresIn: AUTH_COOKIE_MAX_AGE })
        .catch((e: any) => {
          log('error', 'Error minting the cookie -', e.message)
        })
      if (cookie) {
        log('minted a session cookie', cookie)
        setCookie(event, AUTH_COOKIE_NAME, cookie, {
          maxAge: AUTH_COOKIE_MAX_AGE,
          secure: true,
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
        })
        event.node.res.statusCode = 201
        return ''
      } else {
        log('failed to mint a session cookie')
        event.node.res.statusCode = 401
        return ''
      }
    }
  } else {
    log('deleting the session cookie')
    deleteCookie(event, AUTH_COOKIE_NAME)
    event.node.res.statusCode = 204
  }

  // empty response
  return ''
})

export const ID_TOKEN_MAX_AGE = 5 * 60
