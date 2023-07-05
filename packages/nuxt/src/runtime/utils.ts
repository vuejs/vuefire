// FirebaseError is an interface here but is a class in firebase/app
import type { FirebaseError } from 'firebase-admin'

/**
 * Ensure that the error is a FirebaseError
 *
 * @param err - error to check
 */
export function isFirebaseError(err: any): err is FirebaseError {
  return err != null && 'code' in err
}
