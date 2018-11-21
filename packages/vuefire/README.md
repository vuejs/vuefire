# Vuefire [![Build Status](https://badgen.net/circleci/github/vuejs/vuefire)](https://circleci.com/gh/vuejs/vuefire) [![npm package](https://badgen.net/npm/v/vuefire/next)](https://www.npmjs.com/package/vuefire) [![coverage](https://badgen.net/codecov/c/github/vuejs/vuefire)](https://codecov.io/github/vuejs/vuefire)

> Vue.js bindings for Cloud Firestore

VueFire makes it super easy to bind firestore collections and documents and keep your local data always up to date with their remote versions.

## Firebase Realtime database

If you are looking for Firebase realtime support, install [v1 instead](https://github.com/vuejs/vuefire/tree/v1)

## Installation

```sh
npm i vuefire@next
```

<!-- TODO remove next when releasing v2 -->

## Usage

### Initialize your application

Make sure to initialise your Firebase application before. You can find more information in [Firebase Documentation](https://firebase.google.com/docs/firestore/quickstart):

```js
// initialize your firebase app
firebase.initializeApp({
  projectId: 'YOUR OWN ID',
  databaseURL: 'YOUR OWN URL',
})

// save a reference to the firestore database
// to access it in the future
const db = firebase.firestore()
```

### `firestore` option

Vuefire adds a new `firestore` option to any component. Like `data`, it can be a function that returns an object too.
Make sure to create any property added to `firestore` in `data` as well, like `todos` and `currentTodo` in the following example:

```js
Vue.use(VueFire)

new Vue({
  data: {
    // Usually an array for collection
    todos: [],
    // and null for documents
    currentTodo: null,
  },
  firestore: {
    todos: db.collection('todos'),
    currentTodo: db.collection('todos').doc('1'),
  },
})
```

### `$bind` and `$unbind`

Vuefire globally adds `$bind` and `$unbind` so you can programatically bind and unbind collections/documents/queries to an existing property in your Vue application:

```js
// TodoList.vue
export default {
  data: () => ({ todos: [] }),
  created() {
    // this unbinds any previously bound reference
    this.$bind('todos', db.collection('todos')).then(todos => {
      this.todos === todos
      // todos are ready to be used
      // if it contained any reference to other document or collection, the
      // promise will wait for those references to be fetched as well

      // you can unbind a property anytime you want
      // this will be done automatically when the component is destroyed
      this.$unbind('todos')
    })
  },
}
```

Because `$bind` returns a promise, waiting for it allows you to make your application SSR compatible. If you use Nuxt, you can wait for it in `asyncData`. **You still need to declare the property in `data` though**:

```js
// pages/TodosList.vue
export default {
  data: () => ({ todos: [] }),
  async asyncData () {
    await this.$bind('todos', db.collection('todos')),
    return {}
  }
}
```

**Tips**:

- Use an empty array `[]` as the initial value for a property that holds a collection to make `v-for` always work.
- Use `null` for documents so you can wrap content with a simple `v-if` (ref vue guide)

## References Normalization

In Cloud Firestore you can reference other documents inside of documents (TODO add link). By default VueFire will automatically bind up to one nested references. TODO make sure this is the right choice.

## Contributing

Clone the repo, then:

```sh
$ npm install
$ npm test
```

## License

[MIT](http://opensource.org/licenses/MIT)
