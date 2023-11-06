import type { FirebaseApp } from 'firebase/app'
import {
  ReCaptchaV3Provider,
  ReCaptchaEnterpriseProvider,
  CustomProvider,
  type AppCheckOptions,
} from 'firebase/app-check'
import { VueFireAppCheck } from 'vuefire'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

/**
 * Plugin to initialize the appCheck module on the server.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  // NOTE: appCheck is present because of the check in module.ts
  const options = runtimeConfig.public.vuefire!.appCheck!
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  let provider: AppCheckOptions['provider']

  if (options.provider === 'ReCaptchaV3') {
    provider = new ReCaptchaV3Provider(options.key)
  } else if (options.provider === 'ReCaptchaEnterprise') {
    provider = new ReCaptchaEnterpriseProvider(options.key)
  } else {
    // default provider that fails
    provider = new CustomProvider({
      getToken: () =>
        Promise.reject(
          process.env.NODE_ENV !== 'production'
            ? new Error(
                `[nuxt-vuefire]: Unknown Provider "${
                  // @ts-expect-error: options.provider is never here
                  options.provider
                }".`
                // eslint-disable-next-line indent
              )
            : new Error('app-check/invalid-provider')
        ),
    })
  }

  VueFireAppCheck({
    ...options,
    provider,
  })(firebaseApp, nuxtApp.vueApp)
})
