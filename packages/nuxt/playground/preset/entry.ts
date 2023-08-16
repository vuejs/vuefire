import '#internal/nitro/virtual/polyfill'
import { onRequest } from 'firebase-functions/v2/https'
// auto imported
// import { toNodeListener } from 'h3'

const nitroApp = useNitroApp()
const appConfig = useAppConfig()
const config = useRuntimeConfig()

export const server = onRequest(
  appConfig._firebaseV2HttpRequestOptions || {},
  toNodeListener(nitroApp.h3App)
)
