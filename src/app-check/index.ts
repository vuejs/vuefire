import { FirebaseApp } from 'firebase/app'
import {
  initializeAppCheck,
  AppCheckOptions,
  onTokenChanged,
} from 'firebase/app-check'
import { App, inject, InjectionKey, Ref, ref } from 'vue'
import { getGlobalScope } from '../globals'

export const AppCheckTokenInjectSymbol: InjectionKey<Ref<string | undefined>> =
  Symbol('app-check-token')

export function useAppCheckToken() {
  return inject(AppCheckTokenInjectSymbol)!
}

export function VueFireAppCheck(options: AppCheckOptions) {
  return (firebaseApp: FirebaseApp, app: App) => {
    const appCheck = initializeAppCheck(firebaseApp, options)
    const token = getGlobalScope(app, firebaseApp).run(() => ref<string>())!
    onTokenChanged(appCheck, (newToken) => {
      token.value = newToken.token
    })

    app.provide(AppCheckTokenInjectSymbol, token)
  }
}
