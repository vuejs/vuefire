# Getting Started

Before using Vuefire, make sure you have a Firebase account and a project setup by following the instructions at _[Create a Cloud Firestore project](https://firebase.google.com/docs/firestore/quickstart)_. Keep in mind there are two different databases: _RTDB_ and _Cloud Firestore_ (often referenced as _Firestore_). If you have never read about them, you should first read [Choose a Database](https://firebase.google.com/docs/database/rtdb-vs-firestore) in Firebase documentation. Vuefire supports both versions although you probably will only use one of them in a given project. Througout the docs you will often find snipets showing both, _RTDB_(<RtdbLogo width="24"/>) and _Firestore_ (<CloudstoreLogo height="24"/>) examples. Click on them to switch code samples.

## Installation

In order to get started make sure to install the latest version of `vuefire` as well as `firebase`:

```sh
yarn add vuefire@next firebase
# or
npm install vuefire@next firebase
```

:::warning
Make sure you are installing the `next` tag, otherwise, you will be installing v1 of Vuefire which does not support Cloud Firestore
:::
