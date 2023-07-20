import { ensureAdminApp } from './admin'
export { VueFireAppCheckServer } from './app-check'
export {
  VueFireAuthServer,
  createServerUser,
  AUTH_COOKIE_NAME,
  decodeSessionCookie,
  decodeUserToken,
} from './auth'
export { ensureAdminApp } from './admin'
/**
 * @deprecated use `ensureAdminApp` instead.
 */
export const getAdminApp = ensureAdminApp
export { isFirebaseError } from './utils'
