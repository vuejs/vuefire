import { readFile, stat, access, constants } from 'node:fs/promises'
import stripJsonComments from 'strip-json-comments'
import type { ConsolaInstance } from 'consola'
import type { VueFireNuxtModuleOptions } from './options'

export async function willUseEmulators(
  { emulators }: VueFireNuxtModuleOptions,
  firebaseJsonPath: string,
  logger: ConsolaInstance
): Promise<NonNullable<FirebaseEmulatorsJSON['emulators']> | null> {
  const isEmulatorEnabled =
    (typeof emulators === 'object' ? emulators.enabled : !!emulators) &&
    // Disable emulators on production unless the user explicitly enables them
    (process.env.NODE_ENV !== 'production' || process.env.VUEFIRE_EMULATORS)

  // Avoid even checking the firebase.json
  if (!isEmulatorEnabled) {
    return null
  }

  // return true if the file doesn't exist instead of throwing
  if (await access(firebaseJsonPath, constants.F_OK).catch(() => true)) {
    logger.warn(
      `The "firebase.json" file doesn't exist at "${firebaseJsonPath}".`
    )
    return null
  }

  const fileStats = await stat(firebaseJsonPath)
  if (!fileStats.isFile()) {
    return null
  }
  let firebaseJson: FirebaseEmulatorsJSON | null = null
  try {
    firebaseJson = JSON.parse(
      stripJsonComments(await readFile(firebaseJsonPath, 'utf8'), {
        trailingCommas: true,
      })
    )
  } catch (err) {
    logger.error('Error parsing the `firebase.json` file', err)
    logger.error('Cannot enable Emulators')
  }

  return firebaseJson?.emulators ?? null
}

/**
 * Detects the emulators to enable based on the `firebase.json` file. Returns an object of all the emulators that should
 * be enabled based on the `firebase.json` file and other options and environment variables.
 *
 * @param options - The module options
 * @param firebaseJsonPath - resolved path to the `firebase.json` file
 * @param logger - The logger instance
 */
export function detectEmulators(
  { emulators: _emulatorsOptions, auth }: VueFireNuxtModuleOptions,
  emulators: NonNullable<FirebaseEmulatorsJSON['emulators']>,
  logger: ConsolaInstance
) {
  // normalize the emulators option
  const emulatorsOptions =
    typeof _emulatorsOptions === 'object'
      ? _emulatorsOptions
      : {
          enabled: _emulatorsOptions,
        }

  if (!emulators) {
    if (emulatorsOptions.enabled !== false) {
      logger.warn(
        'You enabled emulators but there is no `emulators` key in your `firebase.json` file. Emulators will not be enabled.'
      )
    }
    return
  }

  const defaultHost: string = emulatorsOptions.host || '127.0.0.1'

  const emulatorsToEnable = services.reduce((acc, service) => {
    if (emulators[service]) {
      // these env variables are automatically picked up by the admin SDK too
      // https://firebase.google.com/docs/emulator-suite/connect_rtdb?hl=en&authuser=0#admin_sdks
      // Also, Firestore is the only one that has a different env variable
      const envKey =
        service === 'firestore'
          ? 'FIRESTORE_EMULATOR_HOST'
          : `FIREBASE_${service.toUpperCase()}_EMULATOR_HOST`

      let host: string | undefined
      let port: number | undefined
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

      // take the values from the firebase.json file
      const emulatorsServiceConfig = emulators[service]
      // they might be picked up from the environment variables
      host ??= emulatorsServiceConfig?.host || defaultHost
      port ??= emulatorsServiceConfig?.port

      const missingHostServices: FirebaseEmulatorService[] = []
      if (emulatorsServiceConfig?.host == null) {
        // we push to warn later in one single warning
        missingHostServices.push(service)
      } else if (emulatorsServiceConfig.host !== host) {
        logger.error(
          `The "${service}" emulator is enabled but the "host" property in the "emulators.${service}" section of your "firebase.json" file is different from the "vuefire.emulators.host" value. You might encounter errors in your app if this is not fixed.`
        )
      }

      // The default value is 127.0.0.1, so it's fine if the user doesn't set it at all
      if (missingHostServices.length > 0 && host !== '127.0.0.1') {
        logger.warn(
          `The "${service.at(
            0
          )!}" emulator is enabled but there is no "host" key in the "emulators.${service}" key of your "firebase.json" file. It is recommended to set it to avoid mismatches between origins. You should probably set it to "${defaultHost}" ("vuefire.emulators.host" value).` +
            (missingHostServices.length > 1
              ? ` The following emulators are also missing the "host" key: ${missingHostServices
                  .slice(1)
                  .join(', ')}.`
              : '')
        )
      }

      if (!port) {
        logger.error(
          `The "${service}" emulator is enabled but there is no "port" property in the "emulators" section of your "firebase.json" file. It must be specified to enable emulators. The "${service}" emulator won't be enabled.`
        )
        return acc
        // if the port is set in the config, it must match the env variable
      } else if (
        emulatorsServiceConfig &&
        emulatorsServiceConfig.port !== port
      ) {
        logger.error(
          `The "${service}" emulator is enabled but the "port" property in the "emulators.${service}" section of your "firebase.json" file is different from the "${envKey}" env variable. You might encounter errors in your app if this is not fixed.`
        )
      }

      // add the emulator to the list
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
