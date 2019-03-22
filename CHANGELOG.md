# [Vuefire 2.0.0-alpha.21 Vuexfire 3.0.0-alpha.15](https://github.com/vuejs/vuefire/compare/4d9e355...9699b09) (2019-03-22)

### Features

- **vuexfire:** add RTDB support ([b7203b7](https://github.com/vuejs/vuefire/commit/b7203b7))
- **vuexfire:** rename exports ([02c1020](https://github.com/vuejs/vuefire/commit/02c1020))
- **vuexfire:** rename injected functions ([e2f2a51](https://github.com/vuejs/vuefire/commit/e2f2a51))

### BREAKING CHANGES

- **vuexfire:** Renamed `firebaseAction` to `firestoreAction` as well as the two added function
  `bindFirebaseRef` and `unbindFirebaseRef` to `bindFirestoreRef` and `unbindFirestoreRef`. This is to
  enable using both RTDB and Cloud Firestore
- **vuexfire:** Rename `bindFirebaseRef` to `bindFirestoreRef` and `unbindFirebaseRef` to
  `unbindFirestoreRef` to allow using them for RTDB
- **vuexfire:** Rename `firebaseMutations` into `vuexfireMutations`. Rename `firebaseAction` into
  `firestoreAction` since we want to allow using RTDB as well and that name will be used for the
  firebaseAction as well
- **vuefire:** the default export is replaced by a named export to make it clearer what you are
  importing from vuefire: Cloud Firestore or RTDB. Replace `import Vuefire from 'vuefire'` by `import { firestorePlugin } from 'vuefire'` and update the plugin installation: `Vue.use(firestorePlugin)`
