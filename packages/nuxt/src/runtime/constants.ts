/**
 * @internal Gets access to the user within the application. This is a symbol to keep it private for the moment.
 */
export const UserSymbol = Symbol('user')

// MUST be named `__session` to be kept in Firebase context, therefore this name is hardcoded
// https://firebase.google.com/docs/hosting/manage-cache#using_cookies
export const AUTH_COOKIE_NAME = '__session'
