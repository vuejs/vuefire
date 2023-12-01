import { connectAuthEmulator, getAuth } from 'firebase/auth'
import type { FirebaseApp } from 'firebase/app'
import { logger } from '../logging'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

/**
 * Setups the auth Emulators
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp
  if (connectedEmulators.has(firebaseApp)) {
    return
  }

  const {
    public: { vuefire },
  } = useRuntimeConfig()

  const host = vuefire?.emulators?.auth?.host
  const port = vuefire?.emulators?.auth?.port

  if (!host || !port) {
    logger.warn('Auth emulator not connected, missing host or port')
    return
  }

  connectAuthEmulator(
    // NOTE: it's fine to use getAuth here because emulators are for dev only
    getAuth(firebaseApp),
    `http://${host}:${port}`,
    vuefire?.emulators?.auth?.options
  )
  logger.info(`Auth emulator connected to http://${host}:${port}`)
  connectedEmulators.set(firebaseApp, true)
})

const connectedEmulators = new WeakMap<FirebaseApp, unknown>()
