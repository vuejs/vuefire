import {
  readBody,
  setCookie,
  assertMethod,
  defineEventHandler,
  deleteCookie,
} from 'h3'

/**
 * Setups an API endpoint to be used by the client to mint a cookie based auth session.
 */
export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')
  const { token } = await readBody(event)

  if (token) {
    setCookie(event, AUTH_COOKIE_NAME, token, {
      maxAge: AUTH_COOKIE_MAX_AGE,
      secure: true,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    })
    // empty content status
  } else {
    // delete the cookie
    deleteCookie(event, AUTH_COOKIE_NAME, {
      maxAge: -1,
    })
  }

  // empty response
  event.node.res.statusCode = 204
  return ''
})

// these must be within this file because the handler gets inlined in dev mode
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 5 * 1_000
// MUST be named session to be kept
// https://firebase.google.com/docs/hosting/manage-cache#using_cookies
const AUTH_COOKIE_NAME = '__session'
