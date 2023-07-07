// handle aliases of firebase packages until https://github.com/vitejs/vite/issues/11114 is fixed

import { join } from 'node:path'
import { resolvePath } from '@nuxt/kit'

/**
 * Adds an alias to the config.resolve.alias if it doesn't exist.
 *
 * @param aliases - config.resolve.alias
 * @param libToCheck - the name of the library to check for e.g. 'firebase/firestore'
 * @param filename - file after the `dist` folder e.g. 'index.mjs' -> 'firebase/firestore/dist/index.mjs'
 */
export async function addMissingAlias(
  aliases: { [find: string]: string },
  libToCheck: string,
  filename: string
) {
  // skip adding it if the alias is already set in user config
  if (!aliases[libToCheck]) {
    // this gives an absolute path which is needed for the alias to work since the firebase package is not including the dist folder in exports
    const resolvedLibFolder = await resolvePath(libToCheck)
    console.log('resolvedLibFolder', libToCheck, resolvedLibFolder)
    const resolvedLibFile = join(
      resolvedLibFolder.slice(0, resolvedLibFolder.lastIndexOf('dist')),
      'dist',
      filename
    )
    console.log('fixedTo', libToCheck, resolvedLibFile)
    aliases[libToCheck] = resolvedLibFile
  }
}
