# VuexFire [![Build Status](https://img.shields.io/circleci/project/posva/vuexfire/master.svg)](https://circleci.com/gh/posva/vuexfire) [![npm package](https://img.shields.io/npm/v/vuexfire.svg)](https://www.npmjs.com/package/vuexfire) [![coverage](https://img.shields.io/codecov/c/github/posva/vuexfire/master.svg)](https://codecov.io/github/posva/vuexfire) ![size](http://img.badgesize.io/posva/vuexfire/master/dist/vuexfire.min.js.svg?compression=gzip)

> SSR ready Firebase binding for [Vuex](https://github.com/vuejs/vuex)

Supports only Vue 2, Vuex 2 and Firebase 2/3
If you need an older version check the `v1` branch: `npm i -D vuexfire@v1`

## Installation

1. Using a CDN:

``` html
<script src="https://unpkg.com/vuexfire"></script>
```

2. In module environments, e.g CommonJS:

``` bash
npm install vue firebase vuexfire --save
```

## Usage

Add the mutations to your root Store and make sure to define the property you
want to bind in the state first:

``` js
import { firebaseMutations } from 'vuexfire'
const store = new Vuex.Store({
  state: {
    todos: [], // Will be bound as an array
    user: null // Will be bound as an object
  },
  mutations: {
    // your mutations
    ...firebaseMutations
  }
})
```

It works with modules as well, but **you don't need to add the mutations there**:
```js
const store = new Vuex.Store({
  modules: {
    todos: {
      state: {
        todos: [], // Will be bound as an array
        user: null // Will be bound as an object
      },
    }
  }
})
```

In order to use VuexFire, you have to enhance actions. This action enhancer
takes the actual action and enhances it with two additional parameters in the
context, `bindFirebaseRef` and `unbindFirebaseRef`:

```js
import { firebaseAction } from 'vuexfire'

const setTodosRef = firebaseAction(({ bindFirebaseRef, unbindFirebaseRef }, { ref }) => {
  // this will unbind any previously bound ref to 'todos'
  bindFirebaseRef('todos', ref)
  // you can unbind it easily too
  unbindFirebaseRef('todos')
})
```

Access it as a usual piece of the state:

```js
const Component = {
  template: '<div>{{ todos }}</div>',
  computed: Vuex.mapState(['todos']),
  created () {
    this.$store.dispatch('setTodosRef', db.ref('todos'))
  }
}
```

## Browser support

VuexFire requires basic `WeakMap` support, which means that if you need to
support any of these browsers:

- IE < 11
- Safari < 7.1
- Android < 5.0

You'll have to include a polyfill. You can
use [Benvie/WeakMap](https://github.com/Benvie/WeakMap)

You can find more information about `WeakMap`
support [here](http://kangax.github.io/compat-table/es6/#test-WeakMap)

## How does it work?

VuexFire uses multiple global mutations prefixed by `vuexfire/` to call the
actual mutations to modify objects and arrays. It listens for updates to your
firebase database and commits mutations to sync your state. Thanks to the action
enhancer `firebaseAction`, it gets access to the local `state` and `commit` so
it works with modules too :+1:

## Examples

You can check out the examples by opening the html files in your browser, or check [this online Demo](https://jsfiddle.net/posva/6w3ks04x/)

## API

### firebaseMutations

This object contains VuexFire internal mutations. They are all prefixed by
`vuexfire/`. This object must be added in the root Store mutations object.

### bindFirebaseRef(key, ref[, options])

_Only available inside of an enhanced action_

Binds a firebase reference to a property in the state. If there was already
another reference bound to the same property, it unbinds it first.

#### options:

```js
{
  cancelCallback: Function, // Cancel callback passed to Firebase when listening for events
  readyCallback: Function, // Callback called once the data has been loaded. Useful for SSR
  errorCallback: Function, // Callback called when there is an error loading the data. Useful for SSR
  wait: Boolean, // (Arrays only) Should Vuexfire wait for the whole array to be populated. Defaults to true
}
```

`wait` can be set to true every time. It's useful to do pagination and SSR.

### unbindFirebaseRef(key)

_Only available inside of an enhanced action_

Unbinds a bound firebase reference to a given property in the state.

## Support on Beerpay
Hey dude! Help me out for a couple of :beers:!

[![Beerpay](https://beerpay.io/posva/vuexfire/badge.svg?style=beer-square)](https://beerpay.io/posva/vuexfire)  [![Beerpay](https://beerpay.io/posva/vuexfire/make-wish.svg?style=flat-square)](https://beerpay.io/posva/vuexfire?focus=wish)
