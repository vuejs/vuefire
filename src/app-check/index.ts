import { FirebaseApp } from 'firebase/app'
import {
  initializeAppCheck,
  AppCheckOptions,
  onTokenChanged,
} from 'firebase/app-check'
import { App, inject, InjectionKey, Ref, ref } from 'vue'
import { scope } from '../globals'

export const AppCheckTokenInjectSymbol: InjectionKey<Ref<string | undefined>> =
  Symbol('app-check-token')

export function useAppCheckToken() {
  return inject(AppCheckTokenInjectSymbol)!
}

export function VueFireAppCheck(options: AppCheckOptions) {
  return (firebaseApp: FirebaseApp | undefined, app: App) => {
    const appCheck = initializeAppCheck(firebaseApp, options)
    const token = scope.run(() => ref<string>())!
    onTokenChanged(appCheck, (newToken) => {
      token.value = newToken.token
    })

    app.provide(AppCheckTokenInjectSymbol, token)
  }
}
