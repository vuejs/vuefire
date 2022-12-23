import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: './src/index',
      name: 'index',
    },
    {
      input: './src/server/index',
      name: 'server/index',
    },
    {
      input: './src/options-api/firestore',
      name: 'options-api/firestore',
    },
    {
      input: './src/options-api/database',
      name: 'options-api/database',
    },
  ],
  declaration: true,
  externals: [
    'firebase',
    'firebase/auth',
    'firebase/app-check',
    'firebase/firestore',
    'firebase/database',
    'firebase/storage',
    '@firebase/app-types',
    '@firebase/database-types',
    '@firebase/firestore-types',
    'firebase-admin',
    'firebase-admin/app',
    'firebase-admin/app-check',
    'firebase-functions',
    'firebase-functions/params',
  ],

  rollup: {
    emitCJS: true,
  },

  // hooks: {
  //   'rollup:options': (ctx, options) => {
  //     if (!Array.isArray(options.output)) {
  //       options.output = options.output ? [options.output] : []
  //     }
  //     options.output.push({
  //       dir: ctx.options.outDir,
  //       format: 'cjs',
  //       entryFileNames: '[name].cjs',
  //       exports: 'auto',
  //       externalLiveBindings: false,
  //       freeze: false,
  //     })
  //   },
  // },
})
