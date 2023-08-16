## [0.2.16](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.15...nuxt-vuefire@0.2.16) (2023-08-16)

### Bug Fixes

- **ssr:** apply multiple reducers for complex data ([eb00e3e](https://github.com/vuejs/vuefire/commit/eb00e3edacded285e9272352ea39478c36448a36))

### Features

- **emulators:** allow disabling emulators with env variable ([ce1c02c](https://github.com/vuejs/vuefire/commit/ce1c02c7abfa799a399e112a0116c6f56f53c2de))

## [0.2.15](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.14...nuxt-vuefire@0.2.15) (2023-08-16)

### Bug Fixes

- **admin:** avoid deleting stale apps on get ([1596a52](https://github.com/vuejs/vuefire/commit/1596a528992590ed1acd9f39fd42b840cfbad1cb))
- correctly preserve id ([f9b0ef5](https://github.com/vuejs/vuefire/commit/f9b0ef52c6aebf0d3ca7108fb85d488116f660d7))

## [0.2.14](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.13...nuxt-vuefire@0.2.14) (2023-08-13)

### Bug Fixes

- **nuxt:** use fork of lru-cache ([a11bf4c](https://github.com/vuejs/vuefire/commit/a11bf4cc039468a1251545dfd3cd903c11632eae))

### Features

- **app-check:** disable with emulators and no service account ([76c8b21](https://github.com/vuejs/vuefire/commit/76c8b2117c1af3351c7989d2d07dbfbc2a3fd661))

## [0.2.13](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.12...nuxt-vuefire@0.2.13) (2023-08-01)

### Bug Fixes

- **emulators:** activate without enabled option in dev ([c2c7267](https://github.com/vuejs/vuefire/commit/c2c7267953913ee92a09087e6734f24dbc8bb4f3))
- **emulators:** do not crash without firebase.json file ([e68977b](https://github.com/vuejs/vuefire/commit/e68977bb7e554805358a0203c06148b9defdb58f))
- **emulators:** pass client side option to hide auth warning ([8424077](https://github.com/vuejs/vuefire/commit/8424077c8817a902a89f026551ba5de712d25c5b))
- **ssr:** serialize non enumerable id ([fa2778a](https://github.com/vuejs/vuefire/commit/fa2778a51145491240c5f2b6140375ae4b01dc10)), closes [vuejs/vuefire#1398](https://github.com/vuejs/vuefire/issues/1398)

### Features

- **app-check:** allow debug in production with VUEFIRE_APPCHECK_DEBUG ([fd5db49](https://github.com/vuejs/vuefire/commit/fd5db491e2da0e112c5b9d0501b7e63561066642))
- **emulators:** warn if firebase.json file is missing ([06f7d70](https://github.com/vuejs/vuefire/commit/06f7d70f7056aa0677c2e208126416cb14b9c594))

## [0.2.12](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.11...nuxt-vuefire@0.2.12) (2023-07-25)

### Bug Fixes

- **app-check:** avoid picking up variable in prod ([f7b956d](https://github.com/vuejs/vuefire/commit/f7b956da8fd287517c500af92b39e26b846af322))

### Features

- **app-check:** automatically pick up env variable ([ea864a6](https://github.com/vuejs/vuefire/commit/ea864a6b68f509c876d3ec5400b2931c31355d59))
- **app-check:** warn user against production leak appcheck ([5f140cd](https://github.com/vuejs/vuefire/commit/5f140cdf145e7ea82a1727d36ebec3b7c3f27223))

## [0.2.11](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.10...nuxt-vuefire@0.2.11) (2023-07-20)

### Bug Fixes

- **emulators:** activate if emulators is present in config ([c9a5c0e](https://github.com/vuejs/vuefire/commit/c9a5c0e6ba6cbbbe09790939901aeeb364f51a80))

## [0.2.10](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.9...nuxt-vuefire@0.2.10) (2023-07-20)

### Bug Fixes

- **emulator:** ensure projectId with Emulators ([7ffdbce](https://github.com/vuejs/vuefire/commit/7ffdbce403397afacab9a3ec6e0c4283acfa2e7c))

## [0.2.9](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.8...nuxt-vuefire@0.2.9) (2023-07-20)

### Features

- **emulators:** allow passing options to auth ([9f5fc27](https://github.com/vuejs/vuefire/commit/9f5fc27ab9382907b96d197318ea961dcd8c87aa))
- **emulators:** improve warning for missing host ([c076c1b](https://github.com/vuejs/vuefire/commit/c076c1bd0e45cec91f1c9059be61e23b7d62efce))
- **emulator:** work without a service account ([6b34f36](https://github.com/vuejs/vuefire/commit/6b34f3683d550b8083514645128ba0106c833d48))

## [0.2.8](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.7...nuxt-vuefire@0.2.8) (2023-07-20)

### Bug Fixes

- **emulator:** missing storage ([bfd93bc](https://github.com/vuejs/vuefire/commit/bfd93bc5112d6fc541023326cc0f6b5825febd5d))

### Features

- add emulators support ([7f86fa7](https://github.com/vuejs/vuefire/commit/7f86fa7e4f7df10336be120e456e7a56cdf0f02d))
- avoid enabling auth emulator without auth ([6ee1c49](https://github.com/vuejs/vuefire/commit/6ee1c49df234a5b86311421239a12fe496a75b4d))
- **emulators:** extra logs to warn user ([728f811](https://github.com/vuejs/vuefire/commit/728f8112cf64f23c0aee3a8256e5d6963cc4d950))
- **logs:** use consola for logs ([f802558](https://github.com/vuejs/vuefire/commit/f8025587aaf3ba4d533ea2d1768d1d96c6799662))

## [0.2.7](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.6...nuxt-vuefire@0.2.7) (2023-07-16)

### Bug Fixes

- **auth:** only apply ssr modules when needed ([671f973](https://github.com/vuejs/vuefire/commit/671f973edd83560e781fd94e89c78ac6748ce847)), closes [vuejs/vuefire#1389](https://github.com/vuejs/vuefire/issues/1389)

## [0.2.6](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.5...nuxt-vuefire@0.2.6) (2023-07-13)

### Bug Fixes

- **api:** mutualize admin sdk initialization ([4169e8d](https://github.com/vuejs/vuefire/commit/4169e8d534129f78df6bf04025447913919a870c))

## [0.2.5](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.4...nuxt-vuefire@0.2.5) (2023-07-13)

### Bug Fixes

- **auth:** correct verification of token id ([fd2050b](https://github.com/vuejs/vuefire/commit/fd2050b2c62465e554df16937aeecb4ce0c5e8bf))
- **ssr:** create user only with auth activated ([078c3ac](https://github.com/vuejs/vuefire/commit/078c3ac9563e5e9788036cc717c4f458a4d9193c))

### Features

- **warn:** doc to docs ([3eec751](https://github.com/vuejs/vuefire/commit/3eec751b31d7e6bc6c6c98cd39d54fa3f775e3b5))

## [0.2.4](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.3...nuxt-vuefire@0.2.4) (2023-07-13)

This release contains no changes.

## [0.2.3](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.2...nuxt-vuefire@0.2.3) (2023-07-13)

### Bug Fixes

- **auth:** authenticated requests on server ([617edfe](https://github.com/vuejs/vuefire/commit/617edfe8653c22c5e4baaa8d148ff81049bbdf05)), closes [#1310](https://github.com/vuejs/vuefire/issues/1310)
- up compatibility requirement ([04795b0](https://github.com/vuejs/vuefire/commit/04795b0613b6ce342c239d36edcf6bffe2e50e0b))

## [0.2.2](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.1...nuxt-vuefire@0.2.2) (2023-07-12)

### Features

- **ssr:** revive TimeStamp and GeoPoint ([deb2fab](https://github.com/vuejs/vuefire/commit/deb2fabb355c1ffcc8acccfb39784f114e497e6d))
- support firebase 10 ([3f9853b](https://github.com/vuejs/vuefire/commit/3f9853bfedad80a415c5bff2d96697ca1b2aa199)), closes [#1385](https://github.com/vuejs/vuefire/issues/1385)

## [0.2.1](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.2.0...nuxt-vuefire@0.2.1) (2023-07-10)

### Bug Fixes

- **auth:** avoid errors when user is logged out ([238fd65](https://github.com/vuejs/vuefire/commit/238fd65b06a4727c72e793fbe3fe39105262873f))

### Features

- **ssr:** handles TimeStamps ([9559e71](https://github.com/vuejs/vuefire/commit/9559e71b307fcc60545b9dd9b4d8d0ee47d3894a))

# [0.2.0](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.1.6...nuxt-vuefire@0.2.0) (2023-07-07)

### Bug Fixes

- allow passing GOOGLE_APPLICATION_CREDENTIALS env variable ([693af39](https://github.com/vuejs/vuefire/commit/693af39a1e086743c2038cde805a6b70d28696b0))

Deprecate `vuefire.admin.serviceAccount` in favor of the environment variable `GOOGLE_APPLICATION_CREDENTIALS`. See the updated [documentation](https://vuefire.vuejs.org/nuxt/getting-started.html#configuration) for more details.
This allows to align better with how the application can be safely deployed to production.

### Features

- **admin:** add user to event context ([67dbffd](https://github.com/vuejs/vuefire/commit/67dbffdefe3a5edc51f2bc251fb0e5c4e539fba7))
- resolve service account path from env variable ([22938c7](https://github.com/vuejs/vuefire/commit/22938c748df6498e124690b4db142b63763a1d9a))

## [0.1.6](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.1.5...nuxt-vuefire@0.1.6) (2023-02-26)

This release contains no changes

## [0.1.5](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.1.4...nuxt-vuefire@0.1.5) (2023-01-17)

This release contains no changes

## [0.1.4](https://github.com/vuejs/vuefire/compare/nuxt-vuefire@0.1.3...nuxt-vuefire@0.1.4) (2023-01-15)

### Bug Fixes

- **auth:** only add mint cookie endpoint with admin sdk ([b81dff0](https://github.com/vuejs/vuefire/commit/b81dff0a64e8229da0c2124b676971846317cb15))

### Features

- reword warn ([ce54d91](https://github.com/vuejs/vuefire/commit/ce54d91191c864edb5beaf1e78c3361af70e061f))

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
