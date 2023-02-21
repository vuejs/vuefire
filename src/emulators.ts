const EmulatorsEnvKeys = {
  database: {
    enabled: "VUEFIRE_DATABASE_EMULATOR_ENABLED",
    host: "VUEFIRE_DATABASE_EMULATOR_HOST",
    port: "VUEFIRE_DATABASE_EMULATOR_PORT"
  },
  firestore: {
    enabled: "VUEFIRE_FIRESTORE_EMULATOR_ENABLED",
    host: "VUEFIRE_FIRESTORE_EMULATOR_HOST",
    port: "VUEFIRE_FIRESTORE_EMULATOR_PORT"
  },
  storage: {
    enabled: "VUEFIRE_STORAGE_EMULATOR_ENABLED",
    host: "VUEFIRE_STORAGE_EMULATOR_HOST",
    port: "VUEFIRE_STORAGE_EMULATOR_PORT"
  }
}

/**
 * Get the emulator config for a given module
 *
 * @internal
 * @param moduleName Name of the Firebase module
 */
export function getEmulatorConfig(moduleName: "database" | "firestore" | "storage") {
  const envKeys = EmulatorsEnvKeys[moduleName]

  let enabled = false
  let host: string | undefined
  let port: number | undefined

  if (process.env) {
    enabled = toBool(process.env.VUEFIRE_EMULATORS_ENABLED) || toBool(process.env[envKeys.enabled])
    host = process.env[envKeys.host] as string
    port = Number(process.env[envKeys.port])
  } else if (typeof useAppConfig === 'function') {
    const appConfig = useAppConfig()
    const emulatorsOptions = appConfig.vuefireOptions.emulators || {}

    enabled = emulatorsOptions.enabled || emulatorsOptions[moduleName]?.enabled
    host = emulatorsOptions[moduleName]?.host
    port = emulatorsOptions[moduleName]?.port
  }

  return {
    enabled,
    host,
    port
  }
}

/**
 * Convert a string value to a boolean
 *
 * @internal
 * @param value
 */
export function toBool(value: unknown): boolean {
  return ['true', '1', 'on', 'yes'].includes(String(value).toLowerCase())
}
