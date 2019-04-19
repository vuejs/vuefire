# Getting Started

Before using Vuexfire, make sure you have a Firebase account and a project setup by following the instructions at _[Create a Cloud Firestore project](https://firebase.google.com/docs/firestore/quickstart)_. Keep in mind there are two different databases: _RTDB_ and _Cloud Firestore_ (often referenced as _Firestore_). If you have never read about them, you should first read _[Choose a Database](https://firebase.google.com/docs/database/rtdb-vs-firestore)_ in Firebase documentation. Vuexfire supports both versions although you probably will only use one of them in a given project. Througout the docs you will often find snipets showing both, _RTDB_(<RtdbLogo width="24"/>) and _Firestore_ (<CloudstoreLogo height="24"/>) examples. Click on them to switch code samples.

## Installation

In order to get started make sure to install the latest version of `vuexfire` as well as `firebase`:

```sh
yarn add vuexfire firebase
# or
npm install vuexfire firebase
```

:::warning

- Vuexfire requires Firebase JS SDK >= 4.

:::

## Adding mutations

In order to use Vuexfire, you must add the mutations exported by the package **at the root of your store and only there**:

```js
import { vuexfireMutations } from 'vuexfire'
import Vuex from 'vuex'

const store = new Vuex.Store({
  mutations: {
    // other mutations
    ...vuexfireMutations,
  },
})
```

This will add some mutations needed to keep your store state in sync with the remote database.

## Easy access to Firebase database

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
export { TimeStamp, GeoPoint } = firebase.firestore

// if using Firebase JS SDK < 5.8.0
db.settings({ timestampsInSnapshots: true })
```

</FirebaseExample>

Now we are ready to bind our first reference and see it update live!
