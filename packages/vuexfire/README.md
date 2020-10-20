# Vuexfire [![Build Status](https://badgen.net/circleci/github/vuejs/vuefire)](https://circleci.com/gh/vuejs/vuefire) [![npm package](https://badgen.net/npm/v/vuexfire)](https://www.npmjs.com/package/vuexfire) [![coverage](https://badgen.net/codecov/c/github/vuejs/vuefire)](https://codecov.io/github/vuejs/vuefire)

> SSR ready Firebase binding for [Vuex](https://github.com/vuejs/vuex)

[Documentation](https://vuefire.vuejs.org/vuexfire)

## Installation

```bash
yarn add firebase vuexfire
# or
npm install firebase vuexfire
```

## Usage

Add the mutations to your root Store and make sure to define the property you
want to bind in the state first:

```js
import { vuexfireMutations } from 'vuexfire'
const store = new Vuex.Store({
  state: {
    todos: [], // Will be bound as an array
    user: null, // Will be bound as an object
  },
  mutations: {
    // your mutations
    ...vuexfireMutations,
  },
})
```

It works with modules as well, but **you should not add the mutations there**:

```js
const store = new Vuex.Store({
  modules: {
    todos: {
      state: {
        todos: [], // Will be bound as an array
        user: null, // Will be bound as an object
      },
    },
  },
})
```

In order to use VuexFire, you have to enhance actions. This action enhancer
takes the actual action and enhances it with two additional parameters in the
context, `bindFirestoreRef` and `unbindFirestoreRef`:

```js
import { firestoreAction } from 'vuexfire'

const setTodosRef = firestoreAction(
  ({ bindFirestoreRef, unbindFirestoreRef }, { ref }) => {
    // this will unbind any previously bound ref to 'todos'
    bindFirestoreRef('todos', ref)
    // you can unbind any ref easily
    unbindFirestoreRef('user')
  }
)
```

Access it as a usual piece of the state:

```js
const Component = {
  template: '<div>{{ todos }}</div>',
  computed: Vuex.mapState(['todos']),
  created() {
    this.$store.dispatch('setTodosRef', { ref: db.collection('todos') })
  },
}
```

## Browser support

VuexFire requires basic `WeakMap` support, which means that if you need to
support any of these browsers:

- IE < 11
- Safari < 7.1
- Android < 5.0

You'll have to include a polyfill. You can
use [atlassian/WeakMap](https://github.com/atlassian/WeakMap).

You can find more information about `WeakMap`
support [here](http://kangax.github.io/compat-table/es6/#test-WeakMap).

## How does it work?

VuexFire uses multiple global mutations prefixed by `vuexfire/` to call the
actual mutations to modify objects and arrays. It listens for updates to your
firebase database and commits mutations to sync your state. Thanks to the action
enhancer `firestoreAction`, it gets access to the local `state` and `commit` so
it works with modules too :+1:

## License

[MIT](http://opensource.org/licenses/MIT)
