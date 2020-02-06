**All _CHANGELOG.md_ files have been move to their respective package folders. This file is no longer being automatically updated**

# [Vuefire 2.0.1 Vuexfire 3.0.1](https://github.com/vuejs/vuefire/compare/694123c...9699b09) (2019-05-25)

### Bug Fixes

- **core**: Old array elements are removed from binding ([f6eeaf863739e264c5784ce83ed6f8f447936265](https://github.com/vuejs/vuefire/commit/f6eeaf863739e264c5784ce83ed6f8f447936265)), Fix [#283](https://github.com/vuejs/vuefire/issues/283)

# [Vuefire 2.0.0 Vuexfire 3.0.0](https://github.com/vuejs/vuefire/compare/694123c...9699b09) (2019-05-25)

## 🎉 Stable Release

After more than one year on alpha, Vuefire and Vuexfire are being released as stable releases. From this point on, no breaking changes will be made

If you are upgrading from `vuefire@^1.0.0`, please check the [Migration guide](https://vuefire.vuejs.org/vuefire/upgrading-from-v1.html)
If you are upgrading from `vuexfire@^2.0.0`, please check the [Migration guide](https://vuefire.vuejs.org/vuexfire/upgrading-from-v2.html)

_This release doesn't add anything new compared to the latest alpha release_

# [Vuefire 2.0.0-alpha.24 Vuexfire 3.0.0-alpha.18](https://github.com/vuejs/vuefire/compare/9699b09...694123c) (2019-05-10)

### Bug Fixes

- ensure objects in beforeCreate ([cd5046b](https://github.com/vuejs/vuefire/commit/cd5046b)), closes [#274](https://github.com/vuejs/vuefire/issues/274)
- pass a default options to bind\* ([75c3e73](https://github.com/vuejs/vuefire/commit/75c3e73))

### Features

- **vuefire:** add reset option
- **vuexfire:** add reset option

### BREAKING CHANGES

- **vuefire/vuexfire:** When unbinding, the data is now, by default reset
  to `null` for items bound as objects, and to an empty array `[]` for
  items bound as an array. This option option can be set to `false` to
  keep the last value instead of resetting it, or to a function returning
  a value to customize the new value. More about it [in the documentation](https://vuefire.vuejs.org/api/vuefire.html#options-2)

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
