import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import type { FirebaseApp } from 'firebase/app'
import { logger } from '../logging'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

/**
 * Setups the Firestore Emulators
 */
export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp
  if (connectedEmulators.has(firebaseApp)) {
    return
  }

  const {
    public: { vuefire },
  } = useRuntimeConfig()

  const host = vuefire?.emulators?.firestore?.host
  const port = vuefire?.emulators?.firestore?.port

  if (!host || !port) {
    logger.warn('Firestore emulator not connected, missing host or port')
    return
  }

  connectFirestoreEmulator(getFirestore(firebaseApp), host, port)
  logger.info(`Firestore emulator connected to http://${host}:${port}`)
  connectedEmulators.set(firebaseApp, true)
})

const connectedEmulators = new WeakMap<FirebaseApp, unknown>()
