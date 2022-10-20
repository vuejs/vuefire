const { createTypeDocApp } = require('./typedoc-markdown.cjs')
const path = require('path')

createTypeDocApp({
  name: 'API Documentation',
  tsconfig: path.resolve(__dirname, './typedoc.tsconfig.json'),
  // entryPointStrategy: 'packages',
  githubPages: false,
  disableSources: true,
  entryPoints: [path.resolve(__dirname, '../src/index.ts')],
}).build()
