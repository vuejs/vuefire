# Introduction

Vuefire is a small and pragmatic solution to create realtime bindings between a Firebase RTDB or a Firebase Cloudstore and your Vue application. Making it straightforward to **always keep your local data in sync** with remotes databases.

## Why

While Firebase SDK does provide an API to keep your local data in sync with any changes happening in the remote database, it is more tedious than you can imagine, and it involves many edge cases. Here is the code you need to write to keep your local state in sync with Firebase **without using Vuefire**. Let's take the example of binding a collection as an array, both with the RTDB and with Cloud Firestore:

<FirebaseExample id="original">

```js
// get RTDB the database instance
const db = firebase
  .initializeApp({ databaseURL: 'https://MY-DATABASE.firebaseio.com' })
  .database()

new Vue({
  // setup the reactive todos property
  data: () => ({ todos: [] }),

  created() {
    const todosRef = db.ref('todos')
    // setup adding childs and save the callback to remove it later
    this.todosRef.on(
      'child_added',
      (snapshot, previousKey) => {
        this.todos.splice(
          // this function is omitted for simplicity reasons
          // it would find the position the new element should
          // be inserted at
          findIndexByKey(this.todos, previousKey) + 1,
          0,
          // get the actual value
          snapshot.val()
        )
      },
      // we are omitting this function for simplicity reasons
      onErrorHandler
    )

    // do the same for items being removed
    this.todosRef.on(
      'child_removed',
      snapshot => {
        // remove the child from the array
        this.todos.splice(findIndexByKey(this.todos, snapshot.key), 1)
      },
      onErrorHandler
    )

    // do the same for items being modified
    this.todosRef.on(
      'child_changed',
      snapshot => {
        // replace the child with the new value
        this.todos.splice(
          findIndexByKey(this.todos, snapshot.key),
          1,
          snapshot.val()
        )
      },
      onErrorHandler
    )

    // and last but not least handle elements being moved
    // this is useful when ordering items
    this.todosRef.on(
      'child_moved',
      (snapshot, prevKey) => {
        // retrieve the item being moved
        const record = this.todos.splice(
          findIndexByKey(this.todos, snapshot.key),
          1
        )[0]
        // add it to the place it should be
        this.todos.splice(
          findIndexByKey(this.todos, prevKey) + 1,
          0,
          // we could also use snapshot.val()
          record
        )
      },
      onErrorHandler
    )
  },
})
```

```js
// get Firestore database instance
const db = firebase.initializeApp({ projectId: 'MY PROJECT ID' }).firestore()

new Vue({
  // setup the reactive todos property
  data: () => ({ todos: [] }),

  created() {
    // unsubscribe can be called to stop listening for changes
    const unsubscribe = db.collection('todos').onSnapshot(ref => {
      ref.docChanges().forEach(change => {
        const { newIndex, oldIndex, doc, type } = change
        if (type === 'added') {
          this.todos.splice(newIndex, 0, doc.data())
          // if we want to handle references we would do it here
        } else if (type === 'modified') {
          // remove the old one first
          this.todos.splice(oldIndex, 1)
          // if we want to handle references we would have to unsubscribe
          // from old references' listeners and subscribe to the new ones
          this.todos.splice(newIndex, 0, doc.data())
        } else if (type === 'removed') {
          this.todos.splice(oldIndex, 1)
          // if we want to handle references we need to unsubscribe
          // from old references
        }
      })
    }, onErrorHandler)
  },
})
```

</FirebaseExample>

:::warning

- In the [**RTDB** example](#original_rtdb), we are omitting the unsubscribe part because it requires to save the return of every listener created to later on call `this.todosRef.off` with _every single_ one of them.
- In the [**Firestore** example](#original_firestore), the code above is not taking into account [Firestore references](https://firebase.google.com/docs/firestore/data-model#references) which **considerably** increases the complexity of binding and [is handled transparently](binding-subscriptions.md#references-firestore-only) by Vuefire
  :::

Now let's look at the equivalent code with vuefire:

<FirebaseExample id="getting-started">

```js
const db = firebase
  .initializeApp({ databaseURL: 'https://MY-DATABASE.firebaseio.com' })
  .database()

new Vue({
  // setup the reactive todos property
  data: () => ({ todos: [] }),

  firebase: {
    todos: db.ref('todos'),
  },
})
```

```js
const db = firebase.initializeApp({ projectId: 'MY PROJECT ID' }).firestore()

new Vue({
  // setup the reactive todos property
  data: () => ({ todos: [] }),

  firestore: {
    todos: db.collection('todos'),
  },
})
```

</FirebaseExample>

And that's it! You can use `todos` anywhere, it will be reactive and always in sync with your remote database. Let's dive deeper and learn about all the features added by Vuefire: [Getting started](getting-started.md)
