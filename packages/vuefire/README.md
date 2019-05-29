# Vuefire [![Build Status](https://badgen.net/circleci/github/vuejs/vuefire)](https://circleci.com/gh/vuejs/vuefire) [![npm package](https://badgen.net/npm/v/vuefire)](https://www.npmjs.com/package/vuefire) [![coverage](https://badgen.net/codecov/c/github/vuejs/vuefire)](https://codecov.io/github/vuejs/vuefire)

> Vue.js bindings for Firebase Cloud Firestore and the Realtime Database

[Documentation](https://vuefire.vuejs.org/vuefire)

VueFire makes it super easy to bind firestore collections and documents and keep your local data always up to date with their remote versions.

## Firebase Realtime database

## Installation

```sh
yarn add firebase vuefire
# or
npm i firebase vuefire
```

## Usage

_Make sure to check the documentation for full usage instructions and tips_

### `firestore` option

Vuefire adds a new `firestore` option to any component. Like `data`, it can be a function that returns an object too.
Make sure to create any property added to `firestore` in `data` as well, like `todos` and `currentTodo` in the following example:

```js
import { firestorePlugin } from 'vuefire'

Vue.use(firestorePlugin)

new Vue({
  data: {
    // use an array for collection
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

**Tips**:

- Use an empty array `[]` as the initial value for a property that holds a collection to make `v-for` always work.
- Use `null` for documents so you can wrap content with a simple `v-if` (ref vue guide)

## References Normalization

In Cloud Firestore you can [reference other documents inside of documents](https://vuefire.vuejs.org/vuefire/binding-subscriptions.html#using-the-data-bound-by-vuefire). By default VueFire will automatically bind up to one nested references.

## Contributing

Clone the repo, then:

```sh
$ yarn
$ yarn test
```

## License

[MIT](http://opensource.org/licenses/MIT)
