<p align="center"><a href="https://vuefire.vuejs.org" target="_blank" rel="noopener noreferrer"><img width="100" src="https://vuefire.vuejs.org/vuefire-logo.svg" alt="VueFire logo"></a></p>

<h1 align="center">Vuefire & Vuexfire</h1>
<p align="center">
  <a href="https://circleci.com/gh/vuejs/vuefire"><img src="https://badgen.net/circleci/github/vuejs/vuefire" alt="Build Status"></a>
  <a href="https://codecov.io/github/vuejs/vuefire"><img src="https://badgen.net/codecov/c/github/vuejs/vuefire" alt="Build Status"></a>
</p>

> Synchronize your data and Firebase Cloud Store database in real-time

[**Documentation**](https://vuefire.vuejs.org)

## Introduction

Firebase provides two solutions to handle real-time databases: Realtime Database
and Cloud Store (which is also a realtime database). In order to keep all
clients data in-sync with its cloud database, their [js
SDK](https://firebase.google.com/docs/firestore/quickstart) provides the tools
to do so. However, it quickly becomes bothersome to _bind_ multiple documents or
collections to your application, keep them synchronized as well as handling
[references](https://firebase.google.com/docs/firestore/manage-data/data-types)
to other documents or collections, which can contain references themselves and
must also be kept up to date. The goal of vuefire and vuexfire is to make this
as simple as a function call that returns a promise so it is also easy to setup
SSR and allows you to focus on developing your application.

To better understand why Vuefire will make it so much easier to develop Vue apps
with firebase, please, check [this link in the
documentation](https://vuefire.vuejs.org/vuefire/#why)

Note: _This repository contains the code for `vuefire` and `vuexfire` packages:_

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
[vuefire-status]: https://badgen.net/npm/v/vuefire
[vuexfire-status]: https://badgen.net/npm/v/vuexfire
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

## Sponsors

**Help me keep working on Open Source in a sustainable way 🚀**. Help me with as little as \$1 a month, [sponsor me on Github](https://github.com/sponsors/posva).

<h3 align="center">Silver Sponsors</h3>

<p align="center">
  <a href="https://www.vuemastery.com" title="Vue Mastery" target="_blank">
    <img src="https://www.vuemastery.com/images/lgo-vuemastery.svg" alt="Vue Mastery logo" height="48px">
  </a>
</p>

<p align="center">
  <a href="https://vuetifyjs.com" target="_blank" title="Vuetify">
    <img src="https://vuejs.org/images/vuetify.png" alt="Vuetify logo" height="48px">
  </a>
</p>

<h3 align="center">Bronze Sponsors</h3>

<p align="center">
  <a href="https://www.storyblok.com" target="_blank" title="Storyblok">
    <img src="https://a.storyblok.com/f/51376/3856x824/fea44d52a9/colored-full.png" alt="Storyblok logo" height="32px">
  </a>
</p>
