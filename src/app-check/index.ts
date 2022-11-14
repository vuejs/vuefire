import { FirebaseApp } from 'firebase/app'
import {
  initializeAppCheck,
  AppCheckOptions,
  onTokenChanged,
} from 'firebase/app-check'
import { App, inject, InjectionKey, Ref, ref } from 'vue'
import { getGlobalScope } from '../globals'
import { isClient } from '../shared'

export const AppCheckTokenInjectSymbol: InjectionKey<Ref<string | undefined>> =
  Symbol('app-check-token')

/**
 * The current app-check token as a `Ref`. Note this is undefined on the server.
 */
export function useAppCheckToken() {
  return inject(AppCheckTokenInjectSymbol)!
}

export interface VueFireAppCheckOptions extends AppCheckOptions {
  /**
   * Setups the debug token global. See https://firebase.google.com/docs/app-check/web/debug-provider. Note you should
   * set to false in production (or not set it at all).
   */
  debug?: boolean
}

export function VueFireAppCheck(options: VueFireAppCheckOptions) {
  return (firebaseApp: FirebaseApp, app: App) => {
    // provide this even on the server for simplicity of usage
    const token = getGlobalScope(firebaseApp, app).run(() => ref<string>())!
    app.provide(AppCheckTokenInjectSymbol, token)

    // AppCheck is client only as it relies on browser apis
    if (!isClient) return

    if (options.debug) {
      // @ts-expect-error: local override
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
    }

    const appCheck = initializeAppCheck(firebaseApp, options)
    onTokenChanged(appCheck, (newToken) => {
      token.value = newToken.token
    })
  }
}
