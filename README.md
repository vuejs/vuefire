# Vuefire / Vuexfire [![Build Status](https://badgen.net/circleci/github/vuejs/vuefire)](https://circleci.com/gh/vuejs/vuefire) [![coverage](https://badgen.net/codecov/c/github/vuejs/vuefire)](https://codecov.io/github/vuejs/vuefire)

> Synchronize your data and Firebase Cloud Store database in real-time

## Introduction

Firebase provides two solutions to handle real-time databases: Realtime Database and Cloud Store (which is also a realtime database).
In order to keep all clients data in-sync with its cloud database, their [js SDK](https://firebase.google.com/docs/firestore/quickstart) provides the tools to do so. However, it quickly becomes bothersome to _bind_ multiple documents or collections to your application, keep them synchronized as well as handling [references](https://firebase.google.com/docs/firestore/manage-data/data-types) to other documents or collections, which can contain references themselves and must also be kept up to date.
The goal of vuefire and vuexfire is to make this as simple as a function call that returns a promise so it is also easy to setup SSR and allows you to focus on developing your application.

<!-- TODO compare code samples -->

Note: _This repository contains the code for `vuefire` and `vuexfire` packages:_

_Current version only supports Cloud Store. Support for both Realtime Database and Cloud Store will be added in the future. If you need to use Realtime Database, use [v1.x.x of vuefire](https://github.com/vuejs/vuefire/tree/v1) or [v2.x.x of vuexfire](https://github.com/posva/vuexfire)_

## Packages

| Package                        | version                                                                       | Description                                    |
| ------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------- |
| [vuefire]                      | [![vuefire-status]][vuefire-package]                                          | Firebase bindings for vue                      |
| [vuexfire]                     | [![vuexfire-status]][vuexfire-package]                                        | Firebase bindings for vuex                     |
| [\@posva/vuefire-bundler]      | [![@posva/vuefire-bundler-status]][\@posva/vuefire-bundler-package]           | Rollup config to bundle packages               |
| [\@posva/vuefire-core]         | [![@posva/vuefire-core-status]][\@posva/vuefire-core-package]                 | Core bindings used for vuefire and vuexfire    |
| [\@posva/vuefire-test-helpers] | [![@posva/vuefire-test-helpers-status]][\@posva/vuefire-test-helpers-package] | Helpers used across core, vuefire and vuexfire |

[vuefire]: packages/vuefire
[vuexfire]: packages/vuexfire
[\@posva/vuefire-bundler]: packages/@posva/vuefire-bundler
[\@posva/vuefire-core]: packages/@posva/vuefire-core
[\@posva/vuefire-test-helpers]: packages/@posva/vuefire-test-helpers
[vuefire-status]: https://badgen.net/npm/v/vuefire/next
[vuexfire-status]: https://badgen.net/npm/v/vuexfire/next
[@posva/vuefire-bundler-status]: https://badgen.net/npm/v/@posva/vuefire-bundler
[@posva/vuefire-core-status]: https://badgen.net/npm/v/@posva/vuefire-core
[@posva/vuefire-test-helpers-status]: https://badgen.net/npm/v/@posva/vuefire-test-helpers
[vuefire-package]: https://npmjs.com/package/vuefire
[vuexfire-package]: https://npmjs.com/package/vuexfire
[\@posva/vuefire-bundler-package]: https://npmjs.com/package/@posva/vuefire-bundler
[\@posva/vuefire-core-package]: https://npmjs.com/package/@posva/vuefire-core
[\@posva/vuefire-test-helpers-package]: https://npmjs.com/package/@posva/vuefire-test-helpers

## Related

- [Firebase Web Docs](https://firebase.google.com/docs/web/setup)
  - [Realtime database](https://firebase.google.com/docs/database/)
  - [Cloud Firestore](https://firebase.google.com/docs/firestore/) (You should try this one which is also realtime)

## License

[MIT](http://opensource.org/licenses/MIT)
