## [0.1.3](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.1.2...nuxt-vuefire@0.1.3) (2023-01-13)

### Bug Fixes

- refactor cookie name var ([59ad275](https://github.com/vuejs/vuefire/commit/59ad27595fac503ecbf0d6d9327dc4e3cc73afa5))

## [0.1.2](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.1.1...nuxt-vuefire@0.1.2) (2023-01-13)

### Bug Fixes

- use file to avoid weird errors ([55e6a9e](https://github.com/vuejs/vuefire/commit/55e6a9e4e5f07362fa25cc17f60e0529ccc990d0))

## [0.1.1](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.1.0...nuxt-vuefire@0.1.1) (2023-01-13)

### Bug Fixes

- should not import from firebase-admin if not used ([50a4c53](https://github.com/vuejs/vuefire/commit/50a4c5320b7ed27d438caeeb695821e263c5940e))

# [0.1.0](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.19...nuxt-vuefire@0.1.0) (2023-01-12)

### Bug Fixes

- handle more service account cases ([c9461ef](https://github.com/vuejs/vuefire/commit/c9461efcdf06017d8c347d2d8355e677a93ca6a1))
- workaround vite resolving issue ([86c276e](https://github.com/vuejs/vuefire/commit/86c276edff2a56d5528b1c37beac2c6a422540dc))

### Code Refactoring

- rename admin.config to admin.options ([c1ba636](https://github.com/vuejs/vuefire/commit/c1ba636a0df68d32f7f8441021dcbd604755764b))

### Features

- improve ssr + admin check ([6698c04](https://github.com/vuejs/vuefire/commit/6698c045080bfbe39681fb5d350eaf5cbfb7efe4))
- mark nuxt-vuefire logs ([1fe0307](https://github.com/vuejs/vuefire/commit/1fe03073f74eb5a2615d2595af27e2aff7eba4b4))

### BREAKING CHANGES

- rename `admin.config` to `admin.options`

## [0.0.19](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.18...nuxt-vuefire@0.0.19) (2023-01-06)

- dependencies updated

## [0.0.18](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.17...nuxt-vuefire@0.0.18) (2022-12-27)

### Bug Fixes

- temporary workaround for non ssr app ([1db0058](https://github.com/vuejs/vuefire/commit/1db0058bb40e883d547363a980936f5f242c2f29))

## [0.0.17](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.16...nuxt-vuefire@0.0.17) (2022-12-16)

### Bug Fixes

- move logging utils within runtime ([79e3604](https://github.com/vuejs/vuefire/commit/79e36042beb416ca4262f896ecee3064f8395227))

## [0.0.16](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.15...nuxt-vuefire@0.0.16) (2022-12-16)

### Bug Fixes

- wrong logging ([db81a3e](https://github.com/vuejs/vuefire/commit/db81a3e5999fe9f75ef6fbb5c7bf0864b20d6ccc))

## [0.0.15](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.0.14...nuxt-vuefire@0.0.15) (2022-12-16)

### Bug Fixes

- **auth:** auto import useCurrentUser ([a033e33](https://github.com/vuejs/vuefire/commit/a033e3314e10a3fd83e6d4cc7910c3afaa63b098))
- **auth:** cookie must be named \_\_session ([6f08cc0](https://github.com/vuejs/vuefire/commit/6f08cc0362bfe024312110246daee360bf02e3c2))

### Features

- add logs ([03b971e](https://github.com/vuejs/vuefire/commit/03b971eecf583c87c1ee8d49a2cd05a94cf25f03))
- **admin:** also check for FUNCTION_NAME env ([eb122b7](https://github.com/vuejs/vuefire/commit/eb122b775b9cb0c918e30aeecdb245166e511744))
- **admin:** make options optional ([64a5e50](https://github.com/vuejs/vuefire/commit/64a5e50fde4cd1047427db2162f758b056ed9f1f))

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
