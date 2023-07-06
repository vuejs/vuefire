const { createTypeDocApp } = require('./typedoc-markdown.cjs')
const path = require('node:path')

createTypeDocApp({
  name: 'API Documentation',
  tsconfig: path.resolve(__dirname, './typedoc.tsconfig.json'),
  // entryPointStrategy: 'packages',
  githubPages: false,
  disableSources: true,
  plugin: ['typedoc-plugin-markdown'],
  entryPoints: [path.resolve(__dirname, '../src/index.ts')],
}).build()
