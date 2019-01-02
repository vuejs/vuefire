# Vuexfire [![Build Status](https://badgen.net/circleci/github/vuejs/vuefire)](https://circleci.com/gh/vuejs/vuefire) [![npm package](https://badgen.net/npm/v/vuexfire/next)](https://www.npmjs.com/package/vuexfire) [![coverage](https://badgen.net/codecov/c/github/vuejs/vuefire)](https://codecov.io/github/vuejs/vuefire)

> SSR ready Firebase binding for [Vuex](https://github.com/vuejs/vuex)

Supports only Vue 2, Vuex 2 and Firebase JavaScript SDK 2/3/4.
If you need an older version check the `v1` branch: `npm i -D vuexfire@v1`

## Installation

1. Using a CDN:

```html
<script src="https://unpkg.com/vuexfire@next"></script>
```

2. In module environments, e.g CommonJS:

```bash
npm install vue firebase vuexfire@next --save
```

## Usage

Add the mutations to your root Store and make sure to define the property you
want to bind in the state first:

```js
import { firebaseMutations } from 'vuexfire'
const store = new Vuex.Store({
  state: {
    todos: [], // Will be bound as an array
    user: null, // Will be bound as an object
  },
  mutations: {
    // your mutations
    ...firebaseMutations,
  },
})
```

It works with modules as well, but **you don't need to add the mutations there**:

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
    this.$store.dispatch('setTodosRef', db.collection('todos'))
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

## Examples

You can check out a complete example in the `/examples` directory.

## API

### firebaseMutations

This object contains VuexFire internal mutations. They are all prefixed by
`vuexfire/`. This object must be added in the root Store mutations object.

### bindFirestoreRef(key, ref)

_Only available inside of an enhanced action_

Binds a firebase reference to a property in the state. If there was already
another reference bound to the same property, it unbinds it first.

```js
bindFirestoreRef('todos', ref)
```

Returns a promise which will resolve when the data is ready, or throw an error if something goes wrong:

```js
bindFirestoreRef('todos', ref)
  .then(() => {
    commit('setTodosLoaded', true)
  })
  .catch(err => {
    console.log(err)
  })
```

### unbindFirestoreRef(key)

_Only available inside of an enhanced action_

Unbinds a bound firebase reference to a given property in the state.

```js
unbindFirestoreRef('todos')
```

## License

[MIT](http://opensource.org/licenses/MIT)
