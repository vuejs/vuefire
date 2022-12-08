import type { FirebaseApp } from 'firebase/app'
import {
  ReCaptchaV3Provider,
  ReCaptchaEnterpriseProvider,
  CustomProvider,
  AppCheckOptions,
} from 'firebase/app-check'
import { VueFireAppCheck } from 'vuefire'
import { defineNuxtPlugin, useAppConfig } from '#app'

/**
 * Plugin to initialize the appCheck module.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const appConfig = useAppConfig()
  // NOTE: appCheck is present because of the check in module.ts
  const options = appConfig.vuefireOptions.appCheck!
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  // default provider for server
  let provider: AppCheckOptions['provider'] = new CustomProvider({
    getToken: () =>
      Promise.reject(
        process.env.NODE_ENV !== 'production'
          ? new Error("[VueFire]: This shouldn't be called on server.")
          : new Error('app-check/invalid-provider')
      ),
  })

  if (options.provider === 'ReCaptchaV3') {
    provider = new ReCaptchaV3Provider(options.key)
  } else if (options.provider === 'ReCaptchaEnterprise') {
    provider = new ReCaptchaEnterpriseProvider(options.key)
  }

  VueFireAppCheck({
    ...options,
    provider,
  })(firebaseApp, nuxtApp.vueApp)
})
