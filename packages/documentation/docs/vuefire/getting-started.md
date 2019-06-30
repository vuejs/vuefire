# Getting Started

Before using Vuefire, make sure you have a Firebase account and a project setup by following the instructions at _[Create a Cloud Firestore project](https://firebase.google.com/docs/firestore/quickstart)_. Keep in mind there are two different databases: _RTDB_ and _Cloud Firestore_ (often referenced as _Firestore_). If you have never read about them, you should first read _[Choose a Database](https://firebase.google.com/docs/database/rtdb-vs-firestore)_ in Firebase documentation. Vuefire supports both versions although you probably will only use one of them in a given project. Throughout the docs you will often find snippets showing both, _RTDB_(<RtdbLogo width="24"/>) and _Firestore_ (<CloudstoreLogo height="24"/>) examples. Click on them to switch code samples.

## Installation

In order to get started make sure to install the latest version of `vuefire` as well as `firebase`:

```sh
yarn add vuefire firebase
# or
npm install vuefire firebase
```

:::warning

- Vuefire requires Firebase JS SDK >= 4.

:::

## Plugin

Vuefire must be installed as a Vue plugin. Make sure to install the right one:

- Install `firestorePlugin` if you need to use _Cloud Firestore_ (often abreviated _Firestore_)
- Install `rtdbPlugin` if you need to use the original _RTDB_ (Real Time Database)
- If you need to use both, check [Using RTDB and Firestore together](../cookbook/rtdb-and-firestore.md)

<FirebaseExample>

```js
import Vue from 'vue'
import { rtdbPlugin } from 'vuefire'

Vue.use(rtdbPlugin)
```

```js
import Vue from 'vue'
import { firestorePlugin } from 'vuefire'

Vue.use(firestorePlugin)
```

</FirebaseExample>

You also need to get a database instance from firebase. This can be put into a `db.js` file in your project to conveniently import it anywhere:

<FirebaseExample>

```js
// Get a RTDB instance
export const db = firebase
  .initializeApp({ databaseURL: 'MY PROJECT URL' })
  .database()
```

```js
// Get a Firestore instance
export const db = firebase
  .initializeApp({ projectId: 'MY PROJECT ID' })
  .firestore()

// Export types that exists in Firestore
// This is not always necessary, but it's used in other examples
const { TimeStamp, GeoPoint } = firebase.firestore
export { TimeStamp, GeoPoint }

// if using Firebase JS SDK < 5.8.0
db.settings({ timestampsInSnapshots: true })
```

</FirebaseExample>

Now we are ready to bind our first reference and see it update live!
