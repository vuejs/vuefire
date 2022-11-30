import type { VueFireAppCheckOptions } from 'vuefire'

/**
 * @internal
 */
export interface _NuxtVueFireAppCheckOptionsBase
  extends Omit<VueFireAppCheckOptions, 'provider'> {
  provider: 'ReCaptchaV3' | 'ReCaptchaEnterprise' | 'Custom'
}

export interface NuxtVueFireAppCheckOptionsReCaptchaV3
  extends _NuxtVueFireAppCheckOptionsBase {
  provider: 'ReCaptchaV3'
  key: string
}

export interface NuxtVueFireAppCheckOptionsReCaptchaEnterprise
  extends _NuxtVueFireAppCheckOptionsBase {
  provider: 'ReCaptchaEnterprise'
  key: string
}

// TODO: Custom provider

export type NuxtVueFireAppCheckOptions =
  | NuxtVueFireAppCheckOptionsReCaptchaV3
  | NuxtVueFireAppCheckOptionsReCaptchaEnterprise
