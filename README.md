<p align="center"><a href="https://vuefire.vuejs.org" target="_blank" rel="noopener noreferrer"><img width="100" src="https://vuefire.vuejs.org/vuefire-logo.svg" alt="VueFire logo"></a></p>

<h1 align="center">Vuefire</h1>
<p align="center">
  <a href="https://circleci.com/gh/vuejs/vuefire"><img src="https://badgen.net/circleci/github/vuejs/vuefire/v3" alt="Build Status"></a>
  <a href="https://codecov.io/github/vuejs/vuefire"><img src="https://badgen.net/codecov/c/github/vuejs/vuefire/v3" alt="Build Status"></a>
</p>

> Synchronize your data and Firebase Cloud Store database in real-time

- Works with Vue 2 and Vue 3
- Supports Composition API
- Supports Vuex
- Automatically listen for changes in nested references

Note: This version currently supports Firebase 7. Support for Firebase 8 is on the way.

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
must also be kept up to date. The goal of Vuefire is to make this as simple as a
function call that returns a promise so it is also easy to setup SSR and allows
you to focus on developing your application.

To better understand why Vuefire will make it so much easier to develop Vue apps
with firebase, please, check [this link in the
documentation](https://vuefire.vuejs.org/vuefire/#why)

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

---

> Some awesome description

Demo (TODO link)

## Copying this project

You can directly create a project from this template by using the [Use this template button](https://github.com/posva/vuefire-boilerplate/generate) if you plan on hosting it on GitHub.

You can also use [degit](https://github.com/Rich-Harris/degit):

```sh
degit posva/vue-ts-lib-boilerplate
```

### Checklist of things to do when creating a lib

#### Rename the project

```sh
sed -i '' 's/vuefire/vue-global-events/g' README.md package.json .github/workflows/release-tag.yml size-checks/*
```

#### Circle CI

- Add the project: https://circleci.com/projects/gh/posva
- Check _Build on forked pull requests_: https://circleci.com/gh/posva/vuefire/edit#advanced-settings
- Check _Auto cancel redundant build_ (same place)

## Dependabot

- Activate it: https://docs.github.com/en/github/administering-a-repository/enabling-and-disabling-version-updates
- Or use dependabot.com

## Github Settings

- Activate Sponsor section

## Remove this section

Remove the section _Checklist_ before releasing.

## Installation

```sh
yarn add vuefire
# or
npm install vuefire
```

## Usage

## API

## Related

## License

[MIT](http://opensource.org/licenses/MIT)

<div align="right">
<sub><em>
This project was created using the <a href="https://github.com/posva/vue-ts-lib-boilerplate" rel="nofollow">Vue Library boilerplate</a> by <a href="https://github.com/posva" rel="nofollow">posva</a>
</em></sub>
</div>
