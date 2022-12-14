import { readBody, setCookie, assertMethod, defineEventHandler } from 'h3'

/**
 * Setups an API endpoint to be used by the client to mint a cookie based auth session.
 */
export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')
  const { token } = await readBody(event)

  // console.log('💚 updating token', token)

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
    setCookie(event, AUTH_COOKIE_NAME, '', {
      maxAge: -1,
      path: '/',
    })
  }

  // empty response
  event.node.res.statusCode = 204
  return ''
})

// TODO: customizable defaults
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 5 * 1_000
export const AUTH_COOKIE_NAME = '_vuefire_jwt'
