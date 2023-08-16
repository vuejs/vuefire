import { App as AdminApp } from 'firebase-admin/app'
import { ensureAdminApp } from 'vuefire/server'
import { defineNuxtPlugin, useRequestEvent, useRuntimeConfig } from '#app'

export default defineNuxtPlugin(() => {
  const event = useRequestEvent()
  const { vuefire } = useRuntimeConfig()

  const firebaseAdminApp = ensureAdminApp(vuefire?.options?.admin?.options)

  // TODO: Is this accessible within middlewares and api routes? or should we use a middleware to add it
  event.context.firebaseApp = firebaseAdminApp

  return {
    provide: {
      firebaseAdminApp,
    },
  }
})

// TODO: should the type extensions be added in a different way to the module?
declare module 'h3' {
  interface H3EventContext {
    /**
     * Firebase Admin User Record. `null` if the user is not logged in or their token is no longer valid and requires a
     * refresh.
     * @experimental This API is experimental and may change in future releases.
     */
    firebaseApp: AdminApp
  }
}
