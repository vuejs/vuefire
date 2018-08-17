# Vuefire Core

> Core logic used for vuefire and vuexfire

This library is intended for internal usage. You are free to use it to create your own plugins but keep in mind that the main target is a Vue plugin

## Installation

```sh
npm i @posva/vuefire-core
```

## Usage

```js
import { bindCollection, bindDocument, walkSet } from '@posva/vuefire-core'

// create an object of operations
const ops = {
  set: (target, path, value) => walkSet(target, path, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1),
}
const vm = new Vue({
  // options
})

const resolve = data => {
  console.log('reference bound:', data)
}

const reject = err => {
  console.log('error binding reference:', err)
}

// unbind is a function that tears down all listeners
const unbindItems = bindCollection(
  {
    // vm could be just an object
    vm,
    // key set on vm
    key: 'items',
    ops,
    collection: db.collection('items'),
    // this is to enable Promise based APIs
    // callback on success
    resolve,
    // callback on error
    reject,
  },
  // default options
  {
    maxRefDepth: 2,
  }
)

const unbindItem = bindDocument(
  {
    // same options as bindCollection except for collection -> document
    document: db.collection('items').doc('0'),
  },
  options
)

unbindItems()
bindCollection({
  // bind a different collection
  key: 'items',
})
```

## License

[MIT](http://opensource.org/licenses/MIT)
