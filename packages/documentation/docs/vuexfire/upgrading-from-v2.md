# Upgrading from Vuexfire v2.x to v3.0

The v2 of Vuexfire removed support of the _RTDB_ and added _Firestore_ support instead. In v3, you can use both. Because of that there were some breaking changes during alpha releases and some of the names of the exports have changed.

If you partially followed, the best place to check for the few breaking changes is [the changelog](https://github.com/vuejs/vuefire/blob/master/CHANGELOG.md)

If you didn't follow during the alpha releases, **no worries**, you can easily catch up and use the latest version of Vuexfire. Follow ahead!

## Renamed imports

To reflect better that mutations are the same for both _RTDB_ and _Firestore_, they have been renamed to `vuexfireMutations`:

```diff
import Vuex from 'vuex'
- import { firebaseMutations } from 'vuexfire'
+ import { vuexfireMutations } from 'vuexfire'

const store = new Vuex.Store({
  mutations: {
    // your mutations
-     ...firebaseMutations
+     ...vuexfireMutations
  }
})
```

`firebaseAction` as well as the injected functions `bindFirebaseRef`/`unbindFirebaseRef` have also been renamed! But because we also support `RTDB`, `firebaseAction` still exists but is meant to be used with _RTDB_ references. If you are migrating from v2, you were likely using _Firestore_, so you should apply these modifications:

```diff
- import { firebaseAction } from 'vuexfire'
+ import { firestoreAction } from 'vuexfire'

- const setTodosRef = firebaseAction(({ bindFirebaseRef, unbindFirebaseRef }) => {
+ const setTodosRef = firestoreAction(({ bindFirestoreRef, unbindFirestoreRef }) => {
  // this will unbind any previously bound ref to 'todos'
-   bindFirebaseRef('todos', db.collection('todos'))
+   bindFirestoreRef('todos', db.collection('todos'))
  // you can unbind any ref easily
-   unbindFirebaseRef('user')
+   unbindFirestoreRef('user')
})
```

🎉 That's it! Your app should be running again! If you found things missing in this small guide, feel free to open an Issue or a Pull Request [on Github](https://github.com/vuejs/vuefire)

You should checkout [the guide](./), there are a few code snippets that may come in handy! You can also use the _RTDB_ alongside _Firestore_ now.
