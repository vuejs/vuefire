# [3.2.0](https://github.com/vuejs/vuefire/compare/vuefire@3.1.24...vuefire@3.2.0) (2024-08-16)

### Bug Fixes

- **types:** augment `vue` rather than `@vue/runtime-core` ([#1565](https://github.com/vuejs/vuefire/issues/1565)) ([ad462bd](https://github.com/vuejs/vuefire/commit/ad462bdbf7614927b6fd2511aba7620a806ced23))

## [3.1.24](https://github.com/vuejs/vuefire/compare/vuefire@3.1.23...vuefire@3.1.24) (2024-07-13)

- Update firebase peer dependencies

## [3.1.23](https://github.com/vuejs/vuefire/compare/vuefire@3.1.22...vuefire@3.1.23) (2024-02-23)

### Bug Fixes

- bindFirestoreRef not reacting to getter ([#1496](https://github.com/vuejs/vuefire/issues/1496)) ([e459dd1](https://github.com/vuejs/vuefire/commit/e459dd18ad7b784e0fd6e84fbb4de48beca7231c))

## [3.1.22](https://github.com/vuejs/vuefire/compare/vuefire@3.1.21...vuefire@3.1.22) (2024-01-05)

### Bug Fixes

- export databaseDefaultSerializer ([#1481](https://github.com/vuejs/vuefire/issues/1481)) ([#1482](https://github.com/vuejs/vuefire/issues/1482)) ([cd6f903](https://github.com/vuejs/vuefire/commit/cd6f9035666b0a0ab70b4e6c770f41191713d6a3))

## [3.1.21](https://github.com/vuejs/vuefire/compare/vuefire@3.1.20...vuefire@3.1.21) (2024-01-03)

- fixed an issue when installing the package

## [3.1.20](https://github.com/vuejs/vuefire/compare/vuefire@3.1.19...vuefire@3.1.20) (2024-01-03)

### Bug Fixes

- **types:** infer type from target RTDB ([fece76e](https://github.com/vuejs/vuefire/commit/fece76ef734994ea28f56e429f9d228167efa1a1))
- **types:** infer type from target firestore ([8814646](https://github.com/vuejs/vuefire/commit/88146460e7abd0a134b5372fa2ed646dff63098f))

### Features

- **auth:** allow directly passing the auth instance ([d5d5e1b](https://github.com/vuejs/vuefire/commit/d5d5e1b650e679a6d85ad4887e077c1cd09499e4)), closes [#1459](https://github.com/vuejs/vuefire/issues/1459)

## [3.1.19](https://github.com/vuejs/vuefire/compare/vuefire@3.1.18...vuefire@3.1.19) (2023-12-01)

### Bug Fixes

- **auth:** allow treeshaking with explicit initialization ([7d94183](https://github.com/vuejs/vuefire/commit/7d941838722c5e78d5a2f2d09714690f1cb83ac3)), closes [vuejs/vuefire#1459](https://github.com/vuejs/vuefire/issues/1459)

IMPORTANT NOTE: if you were using multiple apps and passing a `name` argument to `useFirebaseAuth()`, this will be a breaking change. You will have a warning in the console explaining how to fix it.

### Features

- **auth:** expose internal utils for SSR ([486b415](https://github.com/vuejs/vuefire/commit/486b415a93cdcf203f9e66a9edd03f3b10834262))

## [3.1.18](https://github.com/vuejs/vuefire/compare/vuefire@3.1.17...vuefire@3.1.18) (2023-11-08)

This release contain no changes

## [3.1.17](https://github.com/vuejs/vuefire/compare/vuefire@3.1.16...vuefire@3.1.17) (2023-09-13)

### Bug Fixes

- **options:** run with context for bind ([d988f13](https://github.com/vuejs/vuefire/commit/d988f1389449350e8fa48317a2d9019a8d7f27ab))

### Features

- allow getters to functions ([8b8b26e](https://github.com/vuejs/vuefire/commit/8b8b26ebc428b4c0af81cb72cf91d8799f230215))

## [3.1.16](https://github.com/vuejs/vuefire/compare/vuefire@3.1.15...vuefire@3.1.16) (2023-09-06)

This version includes fixes in the `package.json` file for TypeScript users.

### Features

- **log:** show name of app ([a3df0b1](https://github.com/vuejs/vuefire/commit/a3df0b10e06d250a9369d8d7b70bf66781f99a61))

## [3.1.15](https://github.com/vuejs/vuefire/compare/vuefire@3.1.14...vuefire@3.1.15) (2023-08-16)

### Bug Fixes

- **rtdb:** use ssrKey if given ([c40d517](https://github.com/vuejs/vuefire/commit/c40d51706deb985600bb3e3e568bef32a572969e))

## [3.1.14](https://github.com/vuejs/vuefire/compare/vuefire@3.1.13...vuefire@3.1.14) (2023-08-13)

There are no changes in this release.

## [3.1.13](https://github.com/vuejs/vuefire/compare/vuefire@3.1.12...vuefire@3.1.13) (2023-08-01)

### Bug Fixes

- **app-check:** app-check is actually defined on server too ([359f9d0](https://github.com/vuejs/vuefire/commit/359f9d0014dc35e4b37506db99fd9848204b22a4))
- **firestore:** set pending on queries ([61513f6](https://github.com/vuejs/vuefire/commit/61513f68e9be84887ff716ae83cbb7c390844cd8)), closes [vuejs/vuefire#1317](https://github.com/vuejs/vuefire/issues/1317)

## [3.1.12](https://github.com/vuejs/vuefire/compare/vuefire@3.1.11...vuefire@3.1.12) (2023-07-25)

### Features

- **app-check:** automatically pick up env variable ([ea864a6](https://github.com/vuejs/vuefire/commit/ea864a6b68f509c876d3ec5400b2931c31355d59))

## [3.1.11](https://github.com/vuejs/vuefire/compare/vuefire@3.1.10...vuefire@3.1.11) (2023-07-20)

### Features

- **server:** improve logs ([5ab3e2e](https://github.com/vuejs/vuefire/commit/5ab3e2ee6a5b2627788e9f401dfee90af0aecb0c))

## [3.1.10](https://github.com/vuejs/vuefire/compare/vuefire@3.1.9...vuefire@3.1.10) (2023-07-20)

This release contains no code changes.

## [3.1.9](https://github.com/vuejs/vuefire/compare/vuefire@3.1.8...vuefire@3.1.9) (2023-07-20)

### Features

- expose devalue transformers ([7c1ce18](https://github.com/vuejs/vuefire/commit/7c1ce185f2cec5a6b4a2c60b86d2b0c9fdd06211))
- **logs:** use consola for logs ([f802558](https://github.com/vuejs/vuefire/commit/f8025587aaf3ba4d533ea2d1768d1d96c6799662))
- **logs:** use debug instead of info ([56eabc8](https://github.com/vuejs/vuefire/commit/56eabc8ca3963688c34f05d8da9bf421581b7fa9))

## [3.1.8](https://github.com/vuejs/vuefire/compare/vuefire@3.1.7...vuefire@3.1.8) (2023-07-16)

### Features

- use const name for admin apps ([6f539d4](https://github.com/vuejs/vuefire/commit/6f539d49e8f90df9b542dbfd984bedf80595ba8f))

## [3.1.7](https://github.com/vuejs/vuefire/compare/vuefire@3.1.6...vuefire@3.1.7) (2023-07-13)

- Deprecated undocumented `decodeUserToken()` in favor of `decodeSessionCookie()`

## [3.1.6](https://github.com/vuejs/vuefire/compare/vuefire@3.1.5...vuefire@3.1.6) (2023-07-13)

### Bug Fixes

- **auth:** correct verification of token id ([fd2050b](https://github.com/vuejs/vuefire/commit/fd2050b2c62465e554df16937aeecb4ce0c5e8bf))
- **ssr:** create user only with auth activated ([078c3ac](https://github.com/vuejs/vuefire/commit/078c3ac9563e5e9788036cc717c4f458a4d9193c))

### Features

- **warn:** doc to docs ([3eec751](https://github.com/vuejs/vuefire/commit/3eec751b31d7e6bc6c6c98cd39d54fa3f775e3b5))

## [3.1.5](https://github.com/vuejs/vuefire/compare/vuefire@3.1.4...vuefire@3.1.5) (2023-07-13)

### Features

- **ssr:** extra logs for debugging ([042973b](https://github.com/vuejs/vuefire/commit/042973bf9e50a4731edf34d059f764487f087315))

## [3.1.4](https://github.com/vuejs/vuefire/compare/vuefire@3.1.3...vuefire@3.1.4) (2023-07-13)

### Bug Fixes

- compatibility with Vue 2 ([b92f8bc](https://github.com/vuejs/vuefire/commit/b92f8bc6de7449ea4c7af8d5a175784c88ccfb78)), closes [vuejs/vuefire#1280](https://github.com/vuejs/vuefire/issues/1280)

## [3.1.3](https://github.com/vuejs/vuefire/compare/vuefire@3.1.2...vuefire@3.1.3) (2023-07-12)

This release contains no changes.

## [3.1.2](https://github.com/vuejs/vuefire/compare/vuefire@3.1.1...vuefire@3.1.2) (2023-07-10)

### Bug Fixes

- **server:** catch expired tokens ([310b146](https://github.com/vuejs/vuefire/commit/310b1461467f6af74e2c9b66dae23eb8f28dfd80))

## [3.1.1](https://github.com/vuejs/vuefire/compare/vuefire@3.1.0...vuefire@3.1.1) (2023-07-07)

### Bug Fixes

- use value of currentUser ref in useIsCurrentUserLoaded ([#1344](https://github.com/vuejs/vuefire/issues/1344)) ([d1196d6](https://github.com/vuejs/vuefire/commit/d1196d645ed6cb7f8066ea8bb546c71f4516a20a))

# [3.1.0](https://github.com/vuejs/vuefire/compare/vuefire@3.0.1...vuefire@3.1.0) (2023-02-26)

### Bug Fixes

- avoid uncaught firebase error ([9b20cfc](https://github.com/vuejs/vuefire/commit/9b20cfcb0d3874cb46bdb2cd6282809e67bc6f4c))
- **database:** pending for lists ([ee25d06](https://github.com/vuejs/vuefire/commit/ee25d06883ed89b3160aa1b0417bd80a3de9159d))
- **firestore:** pending value for collections ([3186afb](https://github.com/vuejs/vuefire/commit/3186afb2c651f88c16ed4d0fadb7b4090f17ed49)), closes [#1314](https://github.com/vuejs/vuefire/issues/1314)
- **storage:** propagate the error ([438ee3e](https://github.com/vuejs/vuefire/commit/438ee3e6fe4cf120b58c87b738009b714452e9ec))

### Features

- **auth:** `useIsCurrentUserLoaded()` composable ([#1307](https://github.com/vuejs/vuefire/issues/1307)) ([f640929](https://github.com/vuejs/vuefire/commit/f640929bf0fc002f1dc2385ff2238a797ca7f854))

## [3.0.1](https://github.com/vuejs/vuefire/compare/vuefire@3.0.0...vuefire@3.0.1) (2023-01-06)

### Bug Fixes

- **firestore:** apply converter to nested refs ([fe78629](https://github.com/vuejs/vuefire/commit/fe786297c7fcf50f6f0333eb5acb98002037eb47)), closes [#1263](https://github.com/vuejs/vuefire/issues/1263)
- unwrap promise $databaseBind() ([4e6d32f](https://github.com/vuejs/vuefire/commit/4e6d32f08b5c3fcf0834b6a5a644b294a48c6765)), closes [#1275](https://github.com/vuejs/vuefire/issues/1275)

# [3.0.0](https://github.com/vuejs/vuefire/compare/vuefire@3.0.0-beta.8...vuefire@3.0.0) (2022-12-23)

<p align="center">
  <a href="https://vuefire.vuejs.org" target="_blank" rel="noopener noreferrer">
    <img width="100" src="https://vuefire.vuejs.org/logo.svg" alt="VueFire logo">
  </a>
</p>

VueFire 3 is now entering its stable phase! 🎉

This release doesn't include any changes from the previous beta, but it's now considered a good time to start using it in production.

Head over to the [Documentation](https://vuefire.vuejs.org/) to learn more about VueFire 3.

Report any bugs you find on GitHub Issues.

# [3.0.0-beta.8](https://github.com/vuejs/vuefire/compare/vuefire@3.0.0-beta.7...vuefire@3.0.0-beta.8) (2022-12-21)

### Features

- **database:** expose databaseDefaultSerializer ([278916b](https://github.com/vuejs/vuefire/commit/278916be17676ccee71f86ffcc895606ebdcf872))

# [3.0.0-beta.7](https://github.com/vuejs/vuefire/compare/vuefire@3.0.0-beta.6...vuefire@3.0.0-beta.7) (2022-12-19)

### Bug Fixes

- **firestore:** track all ref subs ([1d46371](https://github.com/vuejs/vuefire/commit/1d463710915b9859c8415cd7848f0780a09df25a)), closes [#1223](https://github.com/vuejs/vuefire/issues/1223)

### Features

- **firestore:** default serverTimestamps to estimate ([ae85a41](https://github.com/vuejs/vuefire/commit/ae85a41a4614c7b4b3526c79aebfb8ac8d6853fd))

# [3.0.0-beta.6](https://github.com/vuejs/vuefire/compare/vuefire@3.0.0-beta.5...vuefire@3.0.0-beta.6) (2022-12-16)

No updates in this release

# [3.0.0-beta.5](https://github.com/vuejs/vuefire/compare/vuefire@3.0.0-beta.4...vuefire@3.0.0-beta.5) (2022-12-16)

### Bug Fixes

- **database:** correctly set pending when hydrating and during racing conditions ([90bd7f5](https://github.com/vuejs/vuefire/commit/90bd7f5cbeada113b1976ea6dd975cead63771f8))
- **firestore:** correctly set pending when hydrating and during racing conditions ([998fe38](https://github.com/vuejs/vuefire/commit/998fe38704e9ad01e47a9f94c9dc7d72fade6940))

# [3.0.0-beta.4](https://github.com/vuejs/vuefire/compare/vuefire@3.0.0-beta.3...vuefire@3.0.0-beta.4) (2022-12-13)

# [3.0.0-beta.3](https://github.com/vuejs/vuefire/compare/vuefire@3.0.0-beta.2...vuefire@3.0.0-beta.3) (2022-12-12)

### Bug Fixes

- pass name internally ([f7b3d44](https://github.com/vuejs/vuefire/commit/f7b3d44d35791a0e393b78b6445527a0bbde3a10))

### Features

- **app-check:** allow specifying your own debug token ([e0b2b5a](https://github.com/vuejs/vuefire/commit/e0b2b5a85c6a95669e07f7b7f178f56145cd0388))
- **auth:** allow passing the app name to getUser functions ([20ab13d](https://github.com/vuejs/vuefire/commit/20ab13d78eef3ff07113d3239e0db80c53e5b049))
- **auth:** handle ssr ([567fd12](https://github.com/vuejs/vuefire/commit/567fd12bc7fa215d9facaf8a6aa114750a74d2b4))
- **nuxt:** handle user context on the server and use LRU cache for apps ([a335c54](https://github.com/vuejs/vuefire/commit/a335c547a79b583d6ae967073dfd95ebe05e7954))
- **ssr:** allow resolving getCurrentUser ([282b6bc](https://github.com/vuejs/vuefire/commit/282b6bce880acb2b3170555fe6062d0b49a5d59a))

# [3.0.0-beta.2](https://github.com/vuejs/vuefire/compare/vuefire@3.0.0-beta.1...vuefire@3.0.0-beta.2) (2022-12-06)

- SSR fixes

# [3.0.0-beta.1](https://github.com/vuejs/vuefire/compare/vuefire@3.0.0-alpha.13...vuefire@3.0.0-beta.1) (2022-12-05)

### Features

- **app-check:** add access to appcheck ([01d5651](https://github.com/vuejs/vuefire/commit/01d5651122045aa5fc119200ae068fc80ad3f2ab))
- **ssr:** use env credentials in prod ([4fadba7](https://github.com/vuejs/vuefire/commit/4fadba79076647ca80905320739ec2b0461af6f6))

# [3.0.0-alpha.13](https://github.com/vuejs/vuefire/compare/vuefire@3.0.0-alpha.12...vuefire@3.0.0-alpha.13) (2022-12-01)

### Bug Fixes

- **ssr:** appcheck force app ([cd5168a](https://github.com/vuejs/vuefire/commit/cd5168a3f70b3d775d7e735aabc97d4b7878a3b0))

# [3.0.0-alpha.12](https://github.com/vuejs/vuefire/compare/v3.0.0-alpha.11...vuefire@3.0.0-alpha.12) (2022-12-01)

### Bug Fixes

- **app-check:** run only in client ([384085e](https://github.com/vuejs/vuefire/commit/384085edbe2e39dc05d9ad78e0600e647805116e))
- **firestore:** pass snapshotOptions before extracting refs ([a61ee09](https://github.com/vuejs/vuefire/commit/a61ee092736c2af726106578a3d792cbc6e2a57a))
- **firestore:** pass the id as a value ([d0afc0a](https://github.com/vuejs/vuefire/commit/d0afc0aa70cd5dd1d05c17b6f266fad81dd0d341))
- **firestore:** skip ref extraction in non pojo ([cc01b84](https://github.com/vuejs/vuefire/commit/cc01b842b31c64709580536f2b6e4c4a6296c7e4)), closes [#1257](https://github.com/vuejs/vuefire/issues/1257)
- nested refs ([c4ab275](https://github.com/vuejs/vuefire/commit/c4ab2757638928d43f3a269118c1c0c974a6994d))
- **options-api:** cleanup variables ([5d244b7](https://github.com/vuejs/vuefire/commit/5d244b75e579ea3feda9aa3beee5c6e39680f791))
- pass options when unbinding documents ([6d4f151](https://github.com/vuejs/vuefire/commit/6d4f1512e26ddcfb0f208abc11feab8ef6e38804))
- resilient walkSet and walkGet ([80879d1](https://github.com/vuejs/vuefire/commit/80879d1e925a1c186f47d7b29c5838b8af40a358))
- **ssr:** fallback value in firestore ([57cdd82](https://github.com/vuejs/vuefire/commit/57cdd824be1439a636655a02c75978f857ba36ba))
- **ssr:** use ssrKey in firestore ([25d86ca](https://github.com/vuejs/vuefire/commit/25d86cac1bb230ac3478aebab92062f6a6f3632c))
- **types:** add undefined for initial values ([76e1527](https://github.com/vuejs/vuefire/commit/76e15277791dcb6097629d6a65bc41c0dab22541))

### Code Refactoring

- **firestore:** rename `$bind` to `$firestoreBind` ([a636c21](https://github.com/vuejs/vuefire/commit/a636c21e6a7fc62827ca83c3363bf648811172ff))
- remove manual bind/unbind methods ([7b8b037](https://github.com/vuejs/vuefire/commit/7b8b037e345d1983cb6b80f2de896ad36a5a9fed))
- rename `unbind()` to `stop()` ([37d3f67](https://github.com/vuejs/vuefire/commit/37d3f67eda2206df4ca346028e6fb573f89e7960))
- rename rtdbPlugin to databasePlugin ([a7f500d](https://github.com/vuejs/vuefire/commit/a7f500dc55df841c7b44ffd512cf944f53fbaef0))

### Features

- wait on server for data ([947a325](https://github.com/vuejs/vuefire/commit/947a32518002cecc36e10e6166f89f7d04c8f749))
- warn wrong usage useDocument(), ... ([098c16c](https://github.com/vuejs/vuefire/commit/098c16c53296a2bd6b7c96b23f1957b2612c406e))

### BREAKING CHANGES

- **database:** when binding to a primitive value in RTDB, VueFire used
  to create an object with a property `.value` for the primitive vaule
  itself. The `.` in front forces to always use a bracket syntax
  (`obj['.value']`) while the `$` doesn't, making its usage cleaner. The
  `$value` and `id` property created in the case of primitives are also
  **enumerable** properties. This should make things easier to debug.

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
