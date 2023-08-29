import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  // explicitly externalize consola since Nuxt has it
  externals: ['consola'],
})
