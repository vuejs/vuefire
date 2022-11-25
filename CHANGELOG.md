# [3.0.0-alpha.11](https://github.com/vuejs/vuefire/compare/v3.0.0-alpha.10...v3.0.0-alpha.11) (2022-11-25)

### Bug Fixes

- avoid warning isSSR ([197b036](https://github.com/vuejs/vuefire/commit/197b03623e1fc5e968bf767f29854e81415cb12d))
- **ssr:** use ssrKey in firestore ([25d86ca](https://github.com/vuejs/vuefire/commit/25d86cac1bb230ac3478aebab92062f6a6f3632c))

### Features

- add global options ([5137a99](https://github.com/vuejs/vuefire/commit/5137a990b790cbee0366aef83a00a4c50865f135))
- **database:** add once option ([0c321fb](https://github.com/vuejs/vuefire/commit/0c321fbf6366d8dd7958768f2c9265bafeae1497))
- **database:** once on server ([c4eb143](https://github.com/vuejs/vuefire/commit/c4eb1432fe11aba1cc5dda107a61ee214d8d70aa))
- **firestore:** force once option during SSR ([397a8de](https://github.com/vuejs/vuefire/commit/397a8de8cc80b37b441fb9f1b40b04234deb1984))

# [3.0.0-alpha.10](https://github.com/vuejs/vuefire/compare/v3.0.0-alpha.9...v3.0.0-alpha.10) (2022-11-21)

### Bug Fixes

- resilient walkSet and walkGet ([80879d1](https://github.com/vuejs/vuefire/commit/80879d1e925a1c186f47d7b29c5838b8af40a358))

### Features

- **auth:** update current profile info ([ae90bed](https://github.com/vuejs/vuefire/commit/ae90bed8f80de7449673e6a145079e3e17318540))
- **firestore:** fetch once option ([094f6a5](https://github.com/vuejs/vuefire/commit/094f6a561b713e94027c73ea4560062493b09be4))

# [3.0.0-alpha.9](https://github.com/vuejs/vuefire/compare/v3.0.0-alpha.8...v3.0.0-alpha.9) (2022-11-17)

### Features

- **auth:** getCurrentUser() ([8bd023a](https://github.com/vuejs/vuefire/commit/8bd023acb714d2d5408ab4331df8ce43f9585854))
- **storage:** handle ssr ([b846d56](https://github.com/vuejs/vuefire/commit/b846d5626cab3acd5611609a786335f86aa1ca8a))

# [3.0.0-alpha.8](https://github.com/vuejs/vuefire/compare/v3.0.0-alpha.7...v3.0.0-alpha.8) (2022-11-15)

### Bug Fixes

- **app-check:** run only in client ([384085e](https://github.com/vuejs/vuefire/commit/384085edbe2e39dc05d9ad78e0600e647805116e))
- **options-api:** cleanup variables ([5d244b7](https://github.com/vuejs/vuefire/commit/5d244b75e579ea3feda9aa3beee5c6e39680f791))
- **ssr:** fallback value in firestore ([57cdd82](https://github.com/vuejs/vuefire/commit/57cdd824be1439a636655a02c75978f857ba36ba))

### Code Refactoring

- rename `unbind()` to `stop()` ([37d3f67](https://github.com/vuejs/vuefire/commit/37d3f67eda2206df4ca346028e6fb573f89e7960))

### Features

- add modules for options api ([908f6c3](https://github.com/vuejs/vuefire/commit/908f6c3e6890dff8dfd165e368e47ba2c95711ba))
- **ssr:** database and firestore ([eca3031](https://github.com/vuejs/vuefire/commit/eca3031cbd9abbbdbdb98f30f1efdd995354bb41))
- **storage:** url, metadata and upload tasks ([b5fa6b9](https://github.com/vuejs/vuefire/commit/b5fa6b9404a2a0f9c2c34293cdff78994dd438bf))

### BREAKING CHANGES

- Composables like `useDocument()` no longer return an
  `unbind()` method. The method is now named `stop()` to better reflect
  that they also stop the Vue watcher on top of stopping the Firebase data
  subscription.

# [3.0.0-alpha.7](https://github.com/vuejs/vuefire/compare/v3.0.0-alpha.6...v3.0.0-alpha.7) (2022-11-11)

### Features

- **app-check:** useAppCheckToken() ([95ea119](https://github.com/vuejs/vuefire/commit/95ea119f8dabc929d4484452dcb37c77a2733734))
- **storage:** useStorageTask (will be renamed) ([5dddcf2](https://github.com/vuejs/vuefire/commit/5dddcf264673e130ab0c8a2f9399dd4febaada8c))

# [3.0.0-alpha.6](https://github.com/vuejs/vuefire/compare/v3.0.0-alpha.5...v3.0.0-alpha.6) (2022-11-10)

### Features

- composables to use firebase ([f854b67](https://github.com/vuejs/vuefire/commit/f854b6764f7457b10934236278a0b7389a35e03e))
- wait on server for data ([947a325](https://github.com/vuejs/vuefire/commit/947a32518002cecc36e10e6166f89f7d04c8f749))

# [3.0.0-alpha.5](https://github.com/vuejs/vuefire/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2022-11-08)

### Bug Fixes

- **firestore:** pass the id as a value ([d0afc0a](https://github.com/vuejs/vuefire/commit/d0afc0aa70cd5dd1d05c17b6f266fad81dd0d341))
- pass options when unbinding documents ([6d4f151](https://github.com/vuejs/vuefire/commit/6d4f1512e26ddcfb0f208abc11feab8ef6e38804))

### Features

- better defaults for wait and reset ([872bd1c](https://github.com/vuejs/vuefire/commit/872bd1cf65d5df3d28c75e03e42c94d7f897926e))
- **database:** allow passing a vue ref ([df66d6e](https://github.com/vuejs/vuefire/commit/df66d6ebd31ce4e3df96a798225677f8d2b1ed8d))
- **database:** rename `.key` property to `id` to match Firestore ([0c0b1e4](https://github.com/vuejs/vuefire/commit/0c0b1e4e092f8b8aded8d295d1c62cb8abb2ae3c))
- **database:** support null as a value ([d1d2b5a](https://github.com/vuejs/vuefire/commit/d1d2b5ac5760ee7539f0385ccd08f154fe9b43c5))
- **firestore:** accept a vue ref as parameter in useCollection() and useDocument() ([ee180a7](https://github.com/vuejs/vuefire/commit/ee180a717256511c43b9ccea3737aebfabb97252))
- **firestore:** allow setting the ref value to null ([7af2c6e](https://github.com/vuejs/vuefire/commit/7af2c6eb8167602f8ce7979960c908a68c56d9e0))
- usePendingPromises() ([b0a65dd](https://github.com/vuejs/vuefire/commit/b0a65ddd40a667ff0abcef15c1ad3ccaa1992a94))

### BREAKING CHANGES

- `wait` option now defaults to `true` to better align
  with SSR. Similarly, the `reset` option now defaults to `false` to
  better align with declarative usage of `useDocument()` and others. If
  you want to keep the old behavior, you can still override the defaults
  globally (refer to global options in the docs).
- **database:** the default `serialize()` option adds a non enumerable
  property named `id` that correspond to the DatabaseRef's `key`. It was
  previously added as a non-enumerable key named `.key`. if you want to
  keep the old behavior you can pass a global `serialize()` to the
  `rtdbPlugin` options:

```ts
import { createApp } from 'vue'
import { rtdbPlugin } from 'vuefire'

const app = createApp()
app.use(rtdbPlugin, {
  serialize: (doc) => {
    // write your personalized serialize version
  },
})
```

# [3.0.0-alpha.4](https://github.com/vuejs/vuefire/compare/v3.0.0-alpha.2...v3.0.0-alpha.4) (2022-10-20)

This version is very different from the previous alpha. If you were using it, make sure to read the list of breaking changes

### Bug Fixes

- make @vue/composition-api optional ([#1068](https://github.com/vuejs/vuefire/issues/1068)) ([33eee5e](https://github.com/vuejs/vuefire/commit/33eee5e47a6b0cd3522d4cd44ec7387c9075fcee))
- nested refs ([c4ab275](https://github.com/vuejs/vuefire/commit/c4ab2757638928d43f3a269118c1c0c974a6994d))

### Build System

- fix peer deps ([3f56f10](https://github.com/vuejs/vuefire/commit/3f56f10091483927e637eacd54be0b31fe073539))

### Code Refactoring

- **firestore:** rename `$bind` to `$firestoreBind` ([a636c21](https://github.com/vuejs/vuefire/commit/a636c21e6a7fc62827ca83c3363bf648811172ff))
- remove manual bind/unbind methods ([7b8b037](https://github.com/vuejs/vuefire/commit/7b8b037e345d1983cb6b80f2de896ad36a5a9fed))
- rename rtdbPlugin to databasePlugin ([a7f500d](https://github.com/vuejs/vuefire/commit/a7f500dc55df841c7b44ffd512cf944f53fbaef0))

### Features

- **database:** add databasePlugin ([058d7dc](https://github.com/vuejs/vuefire/commit/058d7dc8abf3f1fb0927aa515f5bdc024c5968fe))
- **database:** useList for arrays ([86ccfc7](https://github.com/vuejs/vuefire/commit/86ccfc79d44bcc7a87f4d7de79418dfcc5064ba0))
- **database:** useObject for objects ([44413b2](https://github.com/vuejs/vuefire/commit/44413b2ee0de49d56fea81a09168312eaf95c006))
- **firestore:** allow custom converter ([18224e4](https://github.com/vuejs/vuefire/commit/18224e48800e2ef4817ea05f96f3c2a37c26e76e)), closes [#608](https://github.com/vuejs/vuefire/issues/608)
- **firestore:** allow destructuring from useDocument() ([3b376f4](https://github.com/vuejs/vuefire/commit/3b376f48ba239d4463834a472a920912af5e6714))
- **firestore:** allow passing snapshot options ([76d36f5](https://github.com/vuejs/vuefire/commit/76d36f5ae7d0b47af5dcbf71fa7cd7089a2ae184)), closes [#955](https://github.com/vuejs/vuefire/issues/955)
- **firestore:** useDocument ([e5cb5b0](https://github.com/vuejs/vuefire/commit/e5cb5b0cec014e35c1bc507bfa9780f6130315f3))
- **types:** allow generics in useCollection ([57dbbc8](https://github.com/vuejs/vuefire/commit/57dbbc8d702f078db28a6692f390e00811e3c75f))
- **types:** deprecate serializer in favor of converter ([1c8012e](https://github.com/vuejs/vuefire/commit/1c8012eb1db03d70881d5d55602eb9c540b9f045))
- use Firebase 9 ([81701bb](https://github.com/vuejs/vuefire/commit/81701bba36776a2bb75d3581a66d2060f9144591))

### BREAKING CHANGES

- manual bind, and unbind from database and firestore
  have been removed. Use the new functions `useList()`/`useCollection()`
  and `useObject()`/`useDocument()` instead.
- **firestore:** Firestore method `$bind()` is now named
  `$firestoreBind()` to align with Database `$rtdbBind()`. Note this can
  be changed through the plugin options with `bindName`. The same applies
  to `$unbind()` which has been renamed to `$firestoreUnbind()`
- rename `rtdbPlugin` to `databasePlugin` in your code
- VueFire is compatible only with Vue `^2.7.0 || ^3.2.0`,
  it **cannot work with `@vue/composition-api`** (which is natively included and therefore not needed
  on `vue@>=2.7.0`). Note VueFire also requires `firebase@^9.0.0`.
- **firestore:** `options.serialize()` is replaced with `converter`. It
  effectively has the same effect as calling `doc().withConverter()` or
  `collection().withConverter()` but it allows to have a global converter
  that is automatically applied to all snapshots. This custom converter
  adds a non-enumerable `id` property for documents like the previous
  `serialize` options. **If you were not using this option**, you don't
  need to change anything.
- vuefire now requires firebase 9

# [3.0.0-alpha.3](https://github.com/vuejs/vuefire/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2022-10-07)

### Bug Fixes

- make @vue/composition-api optional ([#1068](https://github.com/vuejs/vuefire/issues/1068)) ([33eee5e](https://github.com/vuejs/vuefire/commit/33eee5e47a6b0cd3522d4cd44ec7387c9075fcee))

### Features

- use Firebase 9 ([81701bb](https://github.com/vuejs/vuefire/commit/81701bba36776a2bb75d3581a66d2060f9144591))

### BREAKING CHANGES

- vuefire now requires firebase 9

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
