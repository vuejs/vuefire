# Introduction

Vuexfire is a small and pragmatic solution to create realtime bindings between a Firebase RTDB or a Firebase Cloudstore and your Vuex store. Making it straightforward to **always keep your store state in sync** with remotes databases.

## Why

While Firebase SDK does provide an API to keep your local data in sync with any changes happening in the remote database, it is more tedious than you can imagine, and it involves many edge cases. Here is the code you need to write to keep your local state in sync with Firebase **without using Vuexfire**. Let's take the example of binding a collection as an array, both with the RTDB and with Cloud Firestore:

<FirebaseExample id="original">

```js
// get RTDB the database instance
const db = firebase
  .initializeApp({ databaseURL: 'https://MY-DATABASE.firebaseio.com' })
  .database()

new Vuex.Store({
  state: {
    todos: [],
  },

  mutations: {
    addTodo: (state, { snapshot, previousKey }) => {
      state.todos.splice(
        // this function is omitted for simplicity reasons
        // it would find the position the new element should
        // be inserted at
        findIndexByKey(state.todos, previousKey) + 1,
        0,
        // get the actual value
        snapshot.val()
      )
    },

    removeTodo: (state, { snapshot }) => {
      // remove the child from the array
      state.todos.splice(findIndexByKey(state.todos, snapshot.key), 1)
    },

    updateTodo: (state, { snapshot }) => {
      // replace the child with the new value
      state.todos.splice(
        findIndexByKey(state.todos, snapshot.key),
        1,
        snapshot.val()
      )
    },

    moveTodo: (state, { snapshot, previousKey }) => {
      // retrieve the item being moved
      const record = state.todos.splice(
        findIndexByKey(state.todos, snapshot.key),
        1
      )[0]
      // add it to the place it should be
      state.todos.splice(
        findIndexByKey(state.todos, previousKey) + 1,
        0,
        // we could also use snapshot.val()
        record
      )
    },
  },

  actions: {
    bindTodosRef({ commit }) {
      const todosRef = db.ref('todos')
      // setup adding childs and save the callback to remove it later
      this.todosRef.on(
        'child_added',
        (snapshot, previousKey) => commit('addTodo', { snapshot, previousKey }),
        // we are omitting this function for simplicity reasons
        onErrorHandler
      )

      // do the same for items being removed
      this.todosRef.on(
        'child_removed',
        snapshot => commit('removeTodo', { snapshot }),
        onErrorHandler
      )

      // do the same for items being modified
      this.todosRef.on(
        'child_changed',
        snapshot => commit('updateTodo', { snapshot }),
        onErrorHandler
      )

      // and last but not least handle elements being moved
      // this is useful when ordering items
      this.todosRef.on(
        'child_moved',
        (snapshot, previousKey) =>
          commit('moveTodo', { snapshot, previousKey }),
        onErrorHandler
      )
    },
  },
})

// we need to dispatch the action `bindTodosRef` somewhere and access $store.state.todos
```

```js
// get Firestore database instance
const db = firebase.initializeApp({ projectId: 'MY PROJECT ID' }).firestore()

new Vuex.Store({
  state: {
    todos: [],
  },

  mutations: {
    changeTodo: (state, { newIndex, oldIndex, doc, type }) => {
      if (type === 'added') {
        state.todos.splice(newIndex, 0, doc.data())
        // if we want to handle references we would do it here
      } else if (type === 'modified') {
        // remove the old one first
        state.todos.splice(oldIndex, 1)
        // if we want to handle references we would have to unsubscribe
        // from old references' listeners and subscribe to the new ones
        state.todos.splice(newIndex, 0, doc.data())
      } else if (type === 'removed') {
        state.todos.splice(oldIndex, 1)
        // if we want to handle references we need to unsubscribe
        // from old references
      }
    },
  },

  actions: {
    bindTodosRef({ commit }) {
      // unsubscribe can be called to stop listening for changes
      const unsubscribe = db.collection('todos').onSnapshot(ref => {
        ref.docChanges().forEach(change => {
          const { newIndex, oldIndex, doc, type } = change
          if (type === 'added') {
            commit('changeTodo', { newIndex, oldIndex, doc, type })
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
      })
    },
  },
})

// we need to dispatch the action `bindTodosRef` somewhere and access $store.state.todos
```

</FirebaseExample>

:::warning

This is already a lot of code, but there are many things we are not even handling:

- In the [**RTDB** example](#original_rtdb), we are omitting the unsubscribe part because it requires to save the return of every listener created to later on call `this.todosRef.off` with _every single_ one of them.
- In the [**Firestore** example](#original_firestore), the code above is not taking into account [Firestore references](https://firebase.google.com/docs/firestore/data-model#references) which **considerably** increases the complexity of binding and [is handled transparently](binding-subscriptions.md#references-firestore-only) by Vuexfire
- We cannot tell when the data is bound to our state and ready to do SSR

:::

Now let's look at the equivalent code with Vuexfire:

<FirebaseExample id="getting-started">

```js
import { vuefireMutations, firebaseAction } from 'vuexfire'

const db = firebase
  .initializeApp({ databaseURL: 'https://MY-DATABASE.firebaseio.com' })
  .database()

new Vue.Store({
  // setup the reactive todos property
  state: {
    todos: [],
  },

  mutations: vuefireMutations,

  actions: {
    bindTodosRef: firebaseAction(context => {
      // context contains all original properties like commit, state, etc
      // and adds `bindFirebaseRef` and `unbindFirebaseRef`
      // we return the promise returned by `bindFirebaseRef` that will
      // resolve once data is ready
      return context.bindFirebaseRef('todos', db.collection('todos'))
    }),
  },
})
```

```js
import { vuefireMutations, firestoreAction } from 'vuexfire'

const db = firebase.initializeApp({ projectId: 'MY PROJECT ID' }).firestore()

new Vue.Store({
  // setup the reactive todos property
  state: {
    todos: [],
  },

  mutations: vuefireMutations,

  actions: {
    bindTodosRef: firestoreAction(context => {
      // context contains all original properties like commit, state, etc
      // and adds `bindFirestoreRef` and `unbindFirestoreRef`
      // we return the promise returned by `bindFirestoreRef` that will
      // resolve once data is ready
      return context.bindFirestoreRef('todos', db.collection('todos'))
    }),
  },
})
```

</FirebaseExample>

And that's it! You can use `todos` anywhere, it will be always in sync with your remote database. Let's dive deeper and learn about all the features added by Vuexfire: [Getting started](getting-started.md)
