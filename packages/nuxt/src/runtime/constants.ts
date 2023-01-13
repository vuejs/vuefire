/**
 * @internal Gets access to the user within the application. This is a symbol to keep it private for the moment.
 */
export const UserSymbol = Symbol('user')

// TODO: customizable defaults
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 5 * 1_000

// MUST be named session to be kept
// https://firebase.google.com/docs/hosting/manage-cache#using_cookies
export const AUTH_COOKIE_NAME = '__session'
