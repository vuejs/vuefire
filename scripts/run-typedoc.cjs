const { createTypeDocApp } = require('./typedoc-markdown.cjs')
const path = require('node:path')

createTypeDocApp({
  name: 'API Documentation',
  tsconfig: path.resolve(__dirname, './typedoc.tsconfig.json'),
  categorizeByGroup: true,
  githubPages: false,
  disableSources: true, // some links are in node_modules and it's ugly
  plugin: ['typedoc-plugin-markdown'],
  entryPoints: [
    path.resolve(__dirname, '../src/index.ts'),
    path.resolve(__dirname, '../packages/nuxt/src/module.ts'),
  ],
}).build()
