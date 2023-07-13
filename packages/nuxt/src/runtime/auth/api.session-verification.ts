import { getApp as getAdminApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import {
  readBody,
  setCookie,
  assertMethod,
  defineEventHandler,
  deleteCookie,
} from 'h3'
import { log } from '../logging'

/**
 * Setups an API endpoint to be used by the client to mint a cookie based auth session.
 */
export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')
  const { token } = await readBody(event)

  // log('debug', 'minting a session cookie')
  const adminApp = getAdminApp()
  const adminAuth = getAdminAuth(adminApp)

  // log('debug', 'read idToken from Authorization header', token)
  const verifiedIdToken = token ? await adminAuth.verifyIdToken(token) : null

  if (verifiedIdToken) {
    if (new Date().getTime() / 1_000 - verifiedIdToken.iat > ID_TOKEN_MAX_AGE) {
      event.node.res.statusCode = 301
      return ''
    } else {
      const cookie = await adminAuth
        .createSessionCookie(token!, { expiresIn: AUTH_COOKIE_MAX_AGE })
        .catch((e: any) => {
          log('error', 'Error minting the cookie -', e.message)
        })
      if (cookie) {
        // log('debug', `minted a session cookie for user ${verifiedIdToken.uid}`)
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
        log('error', 'failed to mint a session cookie')
        event.node.res.statusCode = 401
        return ''
      }
    }
  } else {
    // log('debug', 'deleting the session cookie')
    deleteCookie(event, AUTH_COOKIE_NAME)
    event.node.res.statusCode = 204
  }

  // empty response
  return ''
})

// these must be within this file because the handler gets inlined in dev mode
const ID_TOKEN_MAX_AGE = 5 * 60
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 5 * 1_000
// MUST be named session to be kept
// https://firebase.google.com/docs/hosting/manage-cache#using_cookies
const AUTH_COOKIE_NAME = '__session'
