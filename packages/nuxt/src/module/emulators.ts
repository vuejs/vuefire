import type { ConsolaInstance } from 'consola'
import type { VueFireNuxtModuleOptionsResolved } from './options'

/**
 * Detects the emulators to enable based on their API. Returns an object of all the emulators that should be enabled.
 *
 * @param options - The module options
 * @param logger - The logger instance
 */
export async function autodetectEmulators(
  { emulators: options, auth }: VueFireNuxtModuleOptionsResolved,
  logger: ConsolaInstance
) {
  const defaultHost: string = options.host || '127.0.0.1'

  const isEmulatorEnabled =
    // emulators is always defined
    options.enabled &&
    // Disable emulators on production unless the user explicitly enables them
    (process.env.NODE_ENV !== 'production' ||
      (process.env.VUEFIRE_EMULATORS &&
        process.env.VUEFIRE_EMULATORS !== 'false'))

  // Avoid even checking the firebase.json
  if (!isEmulatorEnabled) {
    return null
  }

  const emulatorsResponse: EmulatorsAPIResponse | null = await fetch(
    `http://${defaultHost}:4400/emulators`
  )
    .then((res) => {
      return res.status === 200 ? res.json() : null
    })
    .catch((err: Error) => {
      // skip errors of emulators not running
      if (
        err instanceof Error &&
        typeof err.cause === 'object' &&
        // @ts-expect-error: not in the types
        err.cause?.code !== 'ECONNREFUSED'
      ) {
        logger.error('Error fetching emulators', err)
      }
      return null
    })

  if (!emulatorsResponse) {
    return null
  }

  const emulatorsToEnable = services.reduce((acc, service) => {
    if (emulatorsResponse[service]) {
      let { host, port } = emulatorsResponse[service]!

      // these env variables are automatically picked up by the admin SDK too
      // https://firebase.google.com/docs/emulator-suite/connect_rtdb?hl=en&authuser=0#admin_sdks
      // Also, Firestore is the only one that has a different env variable
      const envKey =
        service === 'firestore'
          ? 'FIRESTORE_EMULATOR_HOST'
          : `FIREBASE_${service.toUpperCase()}_EMULATOR_HOST`

      // Pick up the values from the env variables if set by the user
      if (process.env[envKey]) {
        logger.debug(
          `Using the "${envKey}" env variable to enable the "${service}" emulator.`
        )

        try {
          const url = new URL(`http://${process.env[envKey]}`)
          host = url.hostname
          port = Number(url.port)
          // we do not return here as we want to check the firebase.json file and ensure the values match
          // return acc
        } catch (err) {
          logger.error(
            `The "${envKey}" env variable is set but it is not a valid URL. It should be something like "127.0.0.1:8080". It will be ignored in favor of the "firebase.json" values.`
          )
        }
      }

      // add them
      acc[service] = { host, port }
    }
    return acc
  }, {} as FirebaseEmulatorsToEnable)

  // remove the emulator if auth is not enabled
  if (!auth) {
    // @ts-expect-error: cannot be deleted without ?: but that creates other errors
    delete emulatorsToEnable.auth
    // in case it was set by the env variable
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      logger.warn(
        'The "FIREBASE_AUTH_EMULATOR_HOST" env variable is set but the "vuefire.auth" option is not enabled. The env variable will be ignored and the auth emulator won\'t be enabled.'
      )
      delete process.env.FIREBASE_AUTH_EMULATOR_HOST
    }
  }

  return emulatorsToEnable
}

export type FirebaseEmulatorService =
  | 'auth'
  | 'database'
  | 'firestore'
  | 'functions'
  | 'storage'
// | 'hosting' we are the hosting emulator

const services = [
  'auth',
  'database',
  'firestore',
  'functions',
  'storage',
] as const

export type FirebaseEmulatorsToEnableBase = {
  [key in FirebaseEmulatorService]: { host: string; port: number }
}

export interface FirebaseEmulatorsToEnable
  extends FirebaseEmulatorsToEnableBase {
  auth: {
    host: string
    port: number
    options?: Parameters<typeof import('firebase/auth').connectAuthEmulator>[2]
  }
}

interface EmulatorServiceAddressInfo {
  address: string
  family: string // Assuming this will contain valid IPv4 or IPv6 strings
  port: number
}

interface EmulatorService {
  listen: EmulatorServiceAddressInfo[]
  name: string
  host: string
  port: number
  pid?: number // Assuming this field is optional
  reservedPorts?: number[] // Assuming this field is optional and can be an array of numbers
  webSocketHost?: string // Assuming this field is optional
  webSocketPort?: number // Assuming this field is optional
}

interface EmulatorsAPIResponse {
  hub?: EmulatorService
  ui?: EmulatorService
  logging?: EmulatorService
  auth?: EmulatorService
  functions?: EmulatorService
  firestore?: EmulatorService
  database?: EmulatorService
  hosting?: EmulatorService
  storage?: EmulatorService
}
