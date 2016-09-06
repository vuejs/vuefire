# Vuexfire [![Build Status](https://img.shields.io/circleci/project/posva/vuexfire.svg)](https://circleci.com/gh/posva/vuexfire) [![npm package](https://img.shields.io/npm/v/vuexfire.svg)](https://www.npmjs.com/package/vuexfire) [![coverage](https://img.shields.io/codecov/c/github/posva/vuexfire.svg)](https://codecov.io/github/posva/vuexfire)

> Firebase binding for [Vuex](https://github.com/vuejs/vuex)

This is heavily inspired from [vuefire](https://github.com/vuejs/vuefire).

Supports:

- Vue 1/2 with Vuex 1
- Vue 2 with Vuex 2

## Installation

1. If included as global `<script>`: will install automatically if global `Vue`
   is present.

  ``` html
  <head>
    <!-- Vue -->
    <script src="https://cdn.jsdelivr.net/vue/1.0.24/vue.js"></script>
    <!-- Firebase -->
    <script src="https://gstatic.com/firebasejs/3.0.3/firebase.js"></script>
    <!-- VueFire -->
    <script src="https://cdn.jsdelivr.net/vuefire/1.1.0/vuefire.min.js"></script>
  </head>
  ```

2. In module environments, e.g CommonJS:

  ``` bash
  npm install vue firebase vuexfire --save
  ```

  ``` js
  var Vue = require('vue')
  var VuexFire = require('vuexfire')
  var Firebase = require('firebase')

  // explicit installation required in module environments
  Vue.use(VuexFire)
  ```

## Usage

When binding

### Vuex v1

``` js
var store = new Vuex.Store({
  state: {
    items: null // items must be declared on the state
  }
},
// actions, mutations, etc
)

new Vue({
  el: '#app',
  store: store,
  vuex: {
    getters: {
      items: function (state) { return state.items }
    }
  },
  firebase: {
    items: db.ref('items') // bind as an array
  }
})
```

### Vuex v2

Setup mutations

``` js
var store = new Vuex.Store({
  state: {
    items: null
  },
  mutations: VuexFire.mutations,
  getters: {
    items: function (state) { return state.items }
  }
})

new Vue({
  el: '#app',
  store: store,
  computed: Vuex.mapGetters([
    'items'
  ]),
  firebase: {
    items: db.ref('items')
  }
})
```

Everything else works just as [vuefire](https://github.com/vuejs/vuefire). Refer
to its readme for more documentation.

### Examples

You can checkout the examples by serving an `http-server` at the root of this
project.
