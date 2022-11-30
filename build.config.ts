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
  ],
  declaration: true,
  externals: [
    'firebase',
    'firebase/auth',
    'firebase/app-check',
    'firebase/firestore',
    'firebase/database',
    'firebase/storage',
    '@firebase/firestore-types',
    '@firebase/database-types',
    'firebase-admin',
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
