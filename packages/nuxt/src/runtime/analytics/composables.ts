import { getAnalytics } from 'firebase/analytics'
import { useFirebaseApp } from '../app/composables'

/**
 * Retrieves the Firebase analytics instance. **Returns `null` on the server** and when the platform isn't supported.
 *
 * @param name - name of the application
 * @returns the Analytics instance
 */
export function useAnalytics() {
  return import.meta.client ? getAnalytics(useFirebaseApp()) : null
}
