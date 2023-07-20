import { connectAuthEmulator, getAuth } from 'firebase/auth'
import type { FirebaseApp } from 'firebase/app'
import { logger } from '../logging'
import { defineNuxtPlugin, useRuntimeConfig, useAppConfig } from '#app'

/**
 * Setups the auth Emulators
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp
  if (connectedEmulators.has(firebaseApp)) {
    return
  }

  const {
    vuefire,
    public: { vuefire: publicVuefire },
  } = useRuntimeConfig()

  const host = publicVuefire?.emulators?.auth?.host
  const port = publicVuefire?.emulators?.auth?.port

  if (!host || !port) {
    logger.warn('Auth emulator not connected, missing host or port')
    return
  }

  connectAuthEmulator(
    getAuth(firebaseApp),
    `http://${host}:${port}`,
    vuefire?.options?.emulators?.auth?.options
  )
  logger.info(`Auth emulator connected to http://${host}:${port}`)
  connectedEmulators.set(firebaseApp, true)
})

const connectedEmulators = new WeakMap<FirebaseApp, unknown>()
