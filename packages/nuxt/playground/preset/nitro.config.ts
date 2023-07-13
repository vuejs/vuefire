import { fileURLToPath } from 'node:url'
import type { NitroPreset } from 'nitropack'
import type { HttpsOptions } from 'firebase-functions/v2/https'
import type { RuntimeOptions } from 'firebase-functions'

export default {
  extends: 'firebase',
  entry: fileURLToPath(new URL('./entry.ts', import.meta.url)),
} satisfies NitroPreset

// FIXME: doesn't work
// declare module 'nitropack/config' {
//   interface PresetOptions {
//     firebase?: {
//       onRequestOptions?: HttpsOptions
//     }
//   }
// }

interface FirebaseUserAppConfig {
  firebase?: {
    functions?: {
      runtimeOptions?: RuntimeOptions
      httpsOptions?: HttpsOptions
    }
  }
}

declare module '@nuxt/schema' {
  // interface AppConfig extends FirebaseUserAppConfig {}
  interface RuntimeConfig extends FirebaseUserAppConfig {}
}
