# Vuefire [![Build Status](https://img.shields.io/circleci/project/vuejs/vuefire/firestore.svg)](https://circleci.com/gh/vuejs/vuefire) [![npm package](https://img.shields.io/npm/v/vuefire/next.svg)](https://www.npmjs.com/package/vuefire) [![coverage](https://img.shields.io/codecov/c/github/vuejs/vuefire.svg)](https://codecov.io/github/vuejs/vuefire)

> Vue.js bindings for Cloud Firestore

VueFire makes it super easy to bind firestore collections and documents and keep your local data always up to date with their remote versions.

## Firebase Realtime database

If you are looking for Firebase realtime support, install v1 instead: `npm i vuefire@v1`

## Installation

```sh
npm i vuefire@next
```

<!-- TODO remove next when releasing v2 -->

## Usage

```js
Vue.use(VueFire)

// initialize your firebase app
firebase.initializeApp({
  projectId: 'YOUR OWN ID',
  databaseURL: 'YOUR OWN URL'
})

// save a reference to the firestore database
// to access it in the future
const db = firebase.firestore()

new Vue({
  data: {
    todos: [],
    currentTodo: null
  },
  firestore: {
    todos: db.collection('todos'),
    currentTodo: db.collection('todos').doc('1')
  }
})
```

Always declare the initial properties like `todos` and `currentTodo:` in your `data`.

**Tips**:
- Use an empty array `[]` as the initial value for a property that holds a collection to make `v-for` always work.
- Use `null` for documents so you can wrap content with a simple `v-if` (ref vue guide)

## References Normalization

In Could Firestore you can reference other documents inside of documents (TODO add link). By default VueFire will automatically bind up to one nested references. TODO make sure this is the right choice.

## Contributing

Clone the repo, then:

```bash
$ npm install
$ npm test
```

## License

[MIT](http://opensource.org/licenses/MIT)

