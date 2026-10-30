import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  entries: [
    {
      input: './src/index',
      name: 'index',
    },
    {
      input: './src/server/index',
      name: 'server/index',
    },
  ],
  declaration: true,
  externals: [
    'firebase',
    'firebase/app',
    'firebase/app-check',
    'firebase/auth',
    'firebase/firestore',
    'firebase/database',
    'firebase/storage',
    '@firebase/app-types',
    '@firebase/database-types',
    '@firebase/firestore-types',
    'firebase-admin',
    'firebase-admin/app',
    'firebase-admin/app-check',
    'firebase-admin/auth',
    'firebase-functions',
    'firebase-functions/params',
    'consola',
  ],

  rollup: {
    emitCJS: true,
  },

  hooks: {
    // One ESM output file per source module, so bundlers can drop the feature
    // modules an app never imports — and their `firebase/*` imports with them.
    // A single bundle keeps every `firebase/*` import: the SDK packages
    // register themselves on import and declare no `sideEffects`.
    // CJS doesn't tree-shake, so it stays bundled (`rollup.output` would
    // apply to both formats).
    'rollup:options'(_ctx, options) {
      for (const output of [options.output].flat()) {
        if (output?.format === 'esm') output.preserveModules = true
      }
    },
  },
})
