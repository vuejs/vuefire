import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import type { FirebaseApp } from 'firebase/app'
import { logger } from '../logging'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

/**
 * Setups the Functions Emulators
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp
  if (connectedEmulators.has(firebaseApp)) {
    return
  }

  const {
    public: { vuefire },
  } = useRuntimeConfig()

  const host = vuefire?.emulators?.functions?.host
  const port = vuefire?.emulators?.functions?.port

  if (!host || !port) {
    return
  }

  connectFunctionsEmulator(getFunctions(firebaseApp), host, port)
  logger.info(`Functions emulator connected to http://${host}:${port}`)
  connectedEmulators.set(firebaseApp, true)
})

const connectedEmulators = new WeakMap<FirebaseApp, unknown>()
