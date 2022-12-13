## [0.0.14](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.13...nuxt-vuefire@0.0.14) (2022-12-13)

### Bug Fixes

- **admin:** apply globals if present ([9e43384](https://github.com/vuejs/vuefire/commit/9e43384566fef9ff021fd5b6e33b71df1dc436c4))

### Performance Improvements

- avoid creating custom provider for nothing ([541a6c4](https://github.com/vuejs/vuefire/commit/541a6c4fc781dc2bcc30e45e3b0e2b545d4b629d))

## [0.0.13](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.12...nuxt-vuefire@0.0.13) (2022-12-13)

### Bug Fixes

- **auth:** avoid race conditions ([14c79ae](https://github.com/vuejs/vuefire/commit/14c79aefc2a3668b8f7b26d883e3d417a0ccbc1e)), closes [/github.com/firebase/firebase-js-sdk/blob/master/packages/auth/src/platform_browser/index.ts#L91](https://github.com//github.com/firebase/firebase-js-sdk/blob/master/packages/auth/src/platform_browser/index.ts/issues/L91)

### Features

- use env variables for admin app ([25e72c4](https://github.com/vuejs/vuefire/commit/25e72c4f83db3418e044fd65acd34d551f65ba40))

## [0.0.12](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.11...nuxt-vuefire@0.0.12) (2022-12-12)

### Bug Fixes

- add aliases to workaround vite issue ([15f4e50](https://github.com/vuejs/vuefire/commit/15f4e50a1fab273386ea9425626aa8e8fd0cb3a3))
- add templates to transpiled dirs ([9491488](https://github.com/vuejs/vuefire/commit/94914880033e7ddfd90978d0e06754f06fe84016))

## [0.0.11](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.10...nuxt-vuefire@0.0.11) (2022-12-12)

### Features

- **auth:** handle ssr ([567fd12](https://github.com/vuejs/vuefire/commit/567fd12bc7fa215d9facaf8a6aa114750a74d2b4))
- automatically fix resolve issue ([97f275a](https://github.com/vuejs/vuefire/commit/97f275a60e52a64e979aac96fb155272d2e026b1))
- **nuxt:** add auto imports ([bb9f2fd](https://github.com/vuejs/vuefire/commit/bb9f2fdc14daf2efe660f6bdf41d32e10eccde4b))
- **nuxt:** add auto imports app ([2bf116c](https://github.com/vuejs/vuefire/commit/2bf116c50f103760abded869e714a7075d58c737))
- **nuxt:** handle user context on the server and use LRU cache for apps ([a335c54](https://github.com/vuejs/vuefire/commit/a335c547a79b583d6ae967073dfd95ebe05e7954))
- **nuxt:** simplify getCurrentUser ([1abe9d9](https://github.com/vuejs/vuefire/commit/1abe9d99085e67ee703552d7e69acee2ad94c326))
- **nuxt:** split plugins and check options ot add them ([840ca8b](https://github.com/vuejs/vuefire/commit/840ca8b9f068f6ecabd2d08dfda56636cff9569a))
- useFirebaseApp in nuxt ([df57432](https://github.com/vuejs/vuefire/commit/df574325b8c08af044d8f7827615e1e79dd2bff3))

## [0.0.10](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.9...nuxt-vuefire@0.0.10) (2022-12-06)

- remove prepare script

## [0.0.9](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.8...nuxt-vuefire@0.0.9) (2022-12-06)

- add back runtime folder

## [0.0.8](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.7...nuxt-vuefire@0.0.8) (2022-12-06)

### Features

- **ssr:** fail on unknown provider ([366ccc0](https://github.com/vuejs/vuefire/commit/366ccc0583d384db060ac109df88e69f584e3c57))

## [0.0.7](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.6...nuxt-vuefire@0.0.7) (2022-12-05)

### Features

- **ssr:** use env credentials in prod ([4fadba7](https://github.com/vuejs/vuefire/commit/4fadba79076647ca80905320739ec2b0461af6f6))

## [0.0.6](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.5...nuxt-vuefire@0.0.6) (2022-12-01)

### Bug Fixes

- transpile vuefire ([61d3358](https://github.com/vuejs/vuefire/commit/61d335804b256e8c4c80903cd9cb6cf11b3a24fd))

## [0.0.5](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.4...nuxt-vuefire@0.0.5) (2022-12-01)

### Bug Fixes

- **ssr:** appcheck force app ([cd5168a](https://github.com/vuejs/vuefire/commit/cd5168a3f70b3d775d7e735aabc97d4b7878a3b0))

## [0.0.4](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.3...nuxt-vuefire@0.0.4) (2022-12-01)

### Bug Fixes

- **nuxt:** resolve without extension ([e44a2f4](https://github.com/vuejs/vuefire/commit/e44a2f45b206d8cae0fc7d62b0c4f08011f01085))

## [0.0.3](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.2...nuxt-vuefire@0.0.3) (2022-12-01)

### Bug Fixes

- **nuxt:** remove postinstall script ([bda52ee](https://github.com/vuejs/vuefire/commit/bda52ee6e7dc24764a2d4b7873e3d7af0ee2d592))
- **nuxt:** use env config in prod ([e4d7978](https://github.com/vuejs/vuefire/commit/e4d7978bf816ca8a20058a2413c7bbad3970c8b7))

## 0.0.2 (2022-12-01)

### Bug Fixes

- **nuxt:** ensure plugin is added before router and navigation ([e644b85](https://github.com/vuejs/vuefire/commit/e644b854dd3e93a303726ed3c01486b58b35dc3f))
- **nuxt:** use #app imports ([c741854](https://github.com/vuejs/vuefire/commit/c7418548764c247c62b74312b95aa3e8cde91b26))

### Features

- **nuxt:** support admin-sdk appcheck ([70e69fe](https://github.com/vuejs/vuefire/commit/70e69fef78159d6d3e1ab7344ca8cf836811f1d6))

## <small>0.0.1 (2022-12-01)</small>

- feat(nuxt): support admin-sdk appcheck ([70e69fe](https://github.com/vuejs/vuefire/commit/70e69fe))
- refactor(nuxt): better options and wip app check ([8d2aa52](https://github.com/vuejs/vuefire/commit/8d2aa52))
- refactor(nuxt): wip ([54d374a](https://github.com/vuejs/vuefire/commit/54d374a))
- refactor(nuxt): work locally with workaround vite ([fc340cf](https://github.com/vuejs/vuefire/commit/fc340cf))
