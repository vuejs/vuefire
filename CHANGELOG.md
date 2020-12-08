# [3.0.0-alpha.2](https://github.com/posva/vuefire/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2020-12-08)

- Support for Firebase 8

# [3.0.0-alpha.1](https://github.com/posva/vuefire/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2020-12-01)

### Bug Fixes

- **firestore:** fix plugin for Vue 2 ([8e775dd](https://github.com/posva/vuefire/commit/8e775ddc70a068dee65374a48184812e5882f744))
- **rtdb:** fix global vue 2 ([8dcf8ef](https://github.com/posva/vuefire/commit/8dcf8ef4d9db22a388a3996a166607011f0f9214))

# [3.0.0-alpha.0](https://github.com/posva/vuefire/compare/v2.0.0-alpha.11...v3.0.0-alpha.0) (2020-11-30)

Initial release, existing API from [docs](https://vuefire.vuejs.org/vuefire/getting-started.html#installation) should be the same. Added composition API functions:

- `firestoreBind`
- `firestoreUnbind`
- `rtdbBind`
- `rtdbUnbind`

Waiting for the documentation, rely the typings to know what to pass.

Only Firebase 7 is supported until [this regression](https://github.com/firebase/firebase-js-sdk/issues/4125) is solved.

### Features

- make it work with Vue 2 ([6571605](https://github.com/posva/vuefire/commit/6571605fee777d038c06811cbcc47eeec7202790))
- update types firestore ([66f723a](https://github.com/posva/vuefire/commit/66f723a026b823140029347c6380951e3dfe06aa))
