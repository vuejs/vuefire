import { getDatabase, connectDatabaseEmulator } from 'firebase/database'
import type { FirebaseApp } from 'firebase/app'
import { logger } from '../logging'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

/**
 * Setups the Database Emulators
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp
  if (connectedEmulators.has(firebaseApp)) {
    return
  }

  const {
    public: { vuefire },
  } = useRuntimeConfig()

  const host = vuefire?.emulators?.database?.host
  const port = vuefire?.emulators?.database?.port

  if (!host || !port) {
    return
  }

  connectDatabaseEmulator(getDatabase(firebaseApp), host, port)
  logger.info(`Database emulator connected to http://${host}:${port}`)
  connectedEmulators.set(firebaseApp, true)
})

const connectedEmulators = new WeakMap<FirebaseApp, unknown>()
