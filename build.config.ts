import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  externals: [
    'firebase',
    'firebase/firestore',
    'firebase/database',
    '@firebase/firestore-types',
    '@firebase/database-types',
  ],
})
