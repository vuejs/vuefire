import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  // explicitly externalize consola since Nuxt has it
  externals: ['consola'],
})
