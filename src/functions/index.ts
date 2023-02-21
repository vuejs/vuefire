import {
  getFunctions,
  connectFunctionsEmulator,
} from 'firebase/functions'
import { useFirebaseApp } from '../app'
import { getEmulatorConfig } from '../emulators'

/**
 * Retrieves the Functions instance.
 *
 * @param name - name of the application
 * @returns the Functions instance
 */
export function useFirebaseFunctions(name?: string) {
  const functions = getFunctions(useFirebaseApp(name))
  const functionsEmulator = getEmulatorConfig('functions')

  if (functionsEmulator.enabled) {
    connectFunctionsEmulator(
      functions,
      functionsEmulator.host || 'localhost',
      functionsEmulator.port || 5001
    )
  }

  return functions
}
