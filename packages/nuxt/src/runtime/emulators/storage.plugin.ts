import { getStorage, connectStorageEmulator } from 'firebase/storage'
import type { FirebaseApp } from 'firebase/app'
import { logger } from '../logging'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

/**
 * Setups the Storage Emulators
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp
  if (connectedEmulators.has(firebaseApp)) {
    return
  }

  const {
    public: { vuefire },
  } = useRuntimeConfig()

  const host = vuefire?.emulators?.storage?.host
  const port = vuefire?.emulators?.storage?.port

  if (!host || !port) {
    logger.warn('Storage emulator not connected, missing host or port')
    return
  }

  connectStorageEmulator(getStorage(firebaseApp), host, port)
  logger.info(`Storage emulator connected to http://${host}:${port}`)
  connectedEmulators.set(firebaseApp, true)
})

const connectedEmulators = new WeakMap<FirebaseApp, unknown>()
