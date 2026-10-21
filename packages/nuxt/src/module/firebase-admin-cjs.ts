import type { Plugin } from 'vite'

const FIREBASE_ADMIN_ESM_RE = /[\\/]firebase-admin[\\/]lib[\\/]esm[\\/]/
const DEFAULT_IMPORT_RE = /^import mod from (["'][^"']+["']);?$/m

/**
 * With the Vite Environment API (Nuxt `compatibilityVersion: 5` or `experimental.viteEnvironmentApi`), Nuxt runs
 * dependencies through vite-node during SSR dev instead of letting Node load them. firebase-admin's ESM entries
 * (`lib/esm/*`) are wrappers that `import mod from` a CommonJS file and copy `mod.getApps` and friends. vite-node's
 * CommonJS shim misses the `Object.defineProperty(exports, ...)` re-exports that file uses, so every export ends up
 * `undefined` (https://github.com/vuejs/vuefire/issues/1650). Loading the CommonJS file with Node's own `require`
 * keeps the real exports.
 *
 * @internal
 */
export function firebaseAdminCjsPlugin(): Plugin {
  return {
    name: 'nuxt-vuefire:firebase-admin-cjs',
    apply: 'serve',
    enforce: 'pre',
    transform(code, id, options) {
      if (!options?.ssr || !FIREBASE_ADMIN_ESM_RE.test(id)) return
      if (!DEFAULT_IMPORT_RE.test(code)) return

      return {
        code: code.replace(
          DEFAULT_IMPORT_RE,
          // kept on one line so `map: null` stays accurate
          `import { createRequire } from 'node:module'; const mod = createRequire(import.meta.url)($1);`
        ),
        map: null,
      }
    },
  }
}
