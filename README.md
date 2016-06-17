# VueFire [![Build Status](https://img.shields.io/circleci/project/vuejs/vuefire.svg)](https://circleci.com/gh/vuejs/vuefire) [![npm package](https://img.shields.io/npm/v/vuefire.svg)](https://www.npmjs.com/package/vuefire) [![coverage](https://img.shields.io/codecov/c/github/vuejs/vuefire.svg)](https://codecov.io/github/vuejs/vuefire)

> Vue.js binding for Firebase.

## Installation

1. If included as global `<script>`: will install automatically if global `Vue` is present.

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
  npm install vue firebase vuefire --save
  ```

  ``` js
  var Vue = require('vue')
  var VueFire = require('vuefire')
  var Firebase = require('firebase')

  // explicit installation required in module environments
  Vue.use(VueFire)
  ```

## Usage

``` js
var firebaseApp = firebase.initializeApp({ ... })
var db = firebaseApp.database()

var vm = new Vue({
  el: '#demo',
  firebase: {
    // simple syntax, bind as an array by default
    anArray: db.ref('url/to/my/collection'),
    // can also bind to a query
    // anArray: db.ref('url/to/my/collection').limitToLast(25)
    // full syntax
    anObject: {
      source: db.ref('url/to/my/object'),
      // optionally bind as an object
      asObject: true,
      // optionally provide the cancelCallback
      cancelCallback: function () {}
    }
  }
})
```

``` html
<div id="demo">
  <pre>{{ anObject | json }}</pre>
  <ul>
    <li v-for="item in anArray">{{ item.text }}</li>
  </ul>
</div>
```

The above will bind the Vue instance's `anObject` and `anArray` to the respective Firebase data sources. In addition, the instance also gets the `$firebaseRefs` property, which holds the refs for each binding:

``` js
// add an item to the array
vm.$firebaseRefs.anArray.push({
  text: 'hello'
})
```

Alternatively, you can also manually bind to a Firebase ref with the `$bindAsObject` or `$bindAsArray` instance methods:

``` js
vm.$bindAsObject('user', myFirebaseRef.child('user'))
vm.$bindAsArray('items', myFirebaseRef.child('items').limitToLast(25))
```

## Data Normalization

### Array Bindings

Each record in the bound array will contain a `.key` property which specifies the key where the record is stored. So if you have data at `/items/-Jtjl482BaXBCI7brMT8/`, the record for that data will have a `.key` of `"-Jtjl482BaXBCI7brMT8"`.

If an individual record's value in the database is a primitive (boolean, string, or number), the value will be stored in the `.value` property. If the individual record's value is an object, each of the object's properties will be stored as properties of the bound record. As an example, let's assume the `/items/` node you bind to contains the following data:

``` json
{
  "items": {
    "-Jtjl482BaXBCI7brMT8": 100,
    "-Jtjl6tmqjNeAnQvyD4l": {
      "first": "fred",
      "last": "Flintstone"
    },
    "-JtjlAXoQ3VAoNiJcka9": "foo"
  }
}
```

The resulting bound array stored in `vm.items` will be:

``` json
[
  {
    ".key": "-Jtjl482BaXBCI7brMT8",
    ".value": 100
  },
  {
    ".key": "-Jtjl6tmqjNeAnQvyD4l",
    "first": "Fred",
    "last": "Flintstone"
  },
  {
    ".key": "-JtjlAXoQ3VAoNiJcka9",
    ".value": "foo"
  }
]
```

## Contributing

Clone the repo, then:

```bash
$ npm install    # install dependencies
$ npm test       # run test suite with coverage report
$ npm run dev    # watch and build dist/vuefire.js
$ npm run build  # build dist/vuefire.js and vuefire.min.js
```

## License

[MIT](http://opensource.org/licenses/MIT)
