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
