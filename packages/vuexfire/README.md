# Vuexfire [![Build Status](https://img.shields.io/circleci/project/posva/vuexfire.svg)](https://circleci.com/gh/posva/vuexfire) [![npm package](https://img.shields.io/npm/v/vuexfire.svg)](https://www.npmjs.com/package/vuexfire) [![coverage](https://img.shields.io/codecov/c/github/posva/vuexfire.svg)](https://codecov.io/github/posva/vuexfire)

> Firebase binding for [Vuex](https://github.com/vuejs/vuex)

## :construction: This readme is a WIP. It hasn't been fully updated yet

This is heavily inspired from [vuefire](https://github.com/vuejs/vuefire).

Supports only Vue 2, Vuex 2 and Firebase 2/3
If you need an older version check the `v1` tag: `npm i -D vuexfire@v1`

## Installation

1. Using a CDN:

``` html
<script src="https://unpkg.com/vuexfire/dist/vuexfire.js"></script>
```

2. In module environments, e.g CommonJS:

``` bash
npm install vue firebase vuexfire --save
```

3. Add it to your store plugins
``` js
const store = new Vuex.Store({
  // your options
  plugins: [VuexFire]
})
```

## Usage

Make sure to define the property in the state first:

```js
const store = new Vuex.Store({
  state: {
    todos: [], // Will be bound as an array
    user: null // Will be bound as an object
  },
  actions: {
    setTodosRef,
    setUserRef
  }
  // other options
})
```

It works the same with **modules**, define it in the module state:
```js
const store = new Vuex.Store({
  modules: {
    todos: {
      state: {
        todos: [], // Will be bound as an array
        user: null // Will be bound as an object
      },
      actions: {
        setTodosRef,
        setUserRef
      }
    }
  }
  // other options
})
```

Bind a firebase reference inside actions

```js
function setTodosRef({ bind }, { ref }) {
  bind('todos', ref)
}
function setUserRef({ bind }, { ref }) {
  bind('user', ref)
}
```

Access it as an usual piece of the state:

```js
const Component = {
  template: '<div>{{ todos }}</div>',
  computed: Vuex.mapState(['todos']),
  created () {
    this.$store.dispatch('setTodosRef', db.ref('todos'))
  }
}
```

## How does it work?

VuexFire creates some mutations to modify objects and arrays. It listen for
updates to your firebase database and commit mutations to sync your state.

## Examples

You can checkout the examples by serving an `http-server` at the root of this
project.

## API

### VuexFire

Use it as a Vuex plugin by feeding it to the `plugins` array in a Store

### bind(key, ref)

_Only available inside of an action_

Binds a firebase reference to property in the state. If there was already
another reference bound to the same property, it unbinds it first.

### unbind(key)

_Only available inside of an action_

Unbinds a bound firebase reference to a given property in the state.

## Support on Beerpay
Hey dude! Help me out for a couple of :beers:!

[![Beerpay](https://beerpay.io/posva/vuexfire/badge.svg?style=beer-square)](https://beerpay.io/posva/vuexfire)  [![Beerpay](https://beerpay.io/posva/vuexfire/make-wish.svg?style=flat-square)](https://beerpay.io/posva/vuexfire?focus=wish)
