import { readFile, stat } from 'node:fs/promises'
import stripJsonComments from 'strip-json-comments'
import type { ConsolaInstance } from 'consola'
import type { VueFireNuxtModuleOptions } from './options'

export async function enableEmulators(
  { emulators: emulatorOptions, auth }: VueFireNuxtModuleOptions,
  firebaseJsonPath: string,
  logger: ConsolaInstance
) {
  const fileStats = await stat(firebaseJsonPath)
  if (!fileStats.isFile()) {
    return
  }
  let firebaseJson: FirebaseEmulatorsJSON
  try {
    firebaseJson = JSON.parse(
      stripJsonComments(await readFile(firebaseJsonPath, 'utf8'), {
        trailingCommas: true,
      })
    )
  } catch (err) {
    logger.error('Error parsing the `firebase.json` file', err)
    logger.error('Cannot enable Emulators')
    return
  }

  if (!firebaseJson.emulators) {
    if (emulatorOptions === true) {
      logger.warn(
        'You enabled emulators but there is no `emulators` key in your `firebase.json` file. Emulators will not be enabled.'
      )
    }
    return
  }

  const services = [
    'auth',
    'database',
    'firestore',
    'functions',
    'storage',
  ] as const

  const defaultHost =
    typeof emulatorOptions === 'object' ? emulatorOptions.host : 'localhost'

  const emulatorsToEnable = services.reduce((acc, service) => {
    if (firebaseJson.emulators![service]) {
      // these env variables are automatically picked up by the admin SDK too
      // https://firebase.google.com/docs/emulator-suite/connect_rtdb?hl=en&authuser=0#admin_sdks
      const envKey =
        service === 'firestore'
          ? 'FIRESTORE_EMULATOR_HOST'
          : `FIREBASE_${service.toUpperCase()}_EMULATOR_HOST`

      if (process.env[envKey]) {
        try {
          const url = new URL(`http://${process.env[envKey]}`)
          acc[service] = {
            host: url.hostname,
            port: Number(url.port),
          }
          return acc
        } catch (err) {
          logger.error(
            `The "${envKey}" env variable is set but it is not a valid URL. It should be something like "localhost:8080" or "127.0.0.1:8080". It will be ignored.`
          )
          logger.error(`Cannot enable the ${service} Emulator.`)
        }
      }
      // take the values from the firebase.json file
      const serviceEmulatorConfig = firebaseJson.emulators![service]
      if (serviceEmulatorConfig?.host == null) {
        logger.warn(
          `The "${service}" emulator is enabled but there is no "host" key in the "emulators.${service}" key of your "firebase.json" file. It is recommended to set it to avoid mismatches between origins. Set it to "${defaultHost}".`
        )
      }

      const host = serviceEmulatorConfig?.host || defaultHost
      const port = serviceEmulatorConfig?.port
      if (!host || !port) {
        logger.error(
          `The "${service}" emulator is enabled but there is no "host" or "port" key in the "emulators" key of your "firebase.json" file. You must specify *both*. It will be ignored.`
        )
        return acc
      }
      acc[service] = { host, port }
    }
    return acc
  }, {} as FirebaseEmulatorsToEnable)

  // remove the emulator if auth is not enabled
  if (!auth) {
    // @ts-expect-error: cannot be deleted without ?: but that creates other errors
    delete emulatorsToEnable.auth
  }

  return emulatorsToEnable
}

/**
 * Extracted from as we cannot install firebase-tools just for the types
 * - https://github.com/firebase/firebase-tools/blob/master/src/firebaseConfig.ts#L183
 * - https://github.com/firebase/firebase-tools/blob/master/schema/firebase-config.json
 * @internal
 */
export interface FirebaseEmulatorsJSON {
  emulators?: {
    auth?: {
      host?: string
      port?: number
    }
    database?: {
      host?: string
      port?: number
    }
    eventarc?: {
      host?: string
      port?: number
    }
    extensions?: {
      [k: string]: unknown
    }
    firestore?: {
      host?: string
      port?: number
      websocketPort?: number
    }
    functions?: {
      host?: string
      port?: number
    }
    hosting?: {
      host?: string
      port?: number
    }
    hub?: {
      host?: string
      port?: number
    }
    logging?: {
      host?: string
      port?: number
    }
    pubsub?: {
      host?: string
      port?: number
    }
    singleProjectMode?: boolean
    storage?: {
      host?: string
      port?: number
    }
    ui?: {
      enabled?: boolean
      host?: string
      port?: string | number
    }
  }
}

export type FirebaseEmulatorService =
  | 'auth'
  | 'database'
  | 'firestore'
  | 'functions'
  | 'storage'
// | 'hosting' we are the hosting emulator

export type FirebaseEmulatorsToEnable = {
  [key in FirebaseEmulatorService]: { host: string; port: number }
}
