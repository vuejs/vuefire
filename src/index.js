import { createSnapshot, extractRefs } from './utils'

function bindCollection ({
  vm,
  key,
  collection,
  resolve
}) {
  // TODO wait to get all data
  const array = vm[key] = []

  const change = {
    added: ({ newIndex, doc }) => {
      array.splice(newIndex, 0, createSnapshot(doc))
    },
    modified: ({ oldIndex, newIndex, doc }) => {
      array.splice(oldIndex, 1)
      array.splice(newIndex, 0, createSnapshot(doc))
    },
    removed: ({ oldIndex }) => {
      array.splice(oldIndex, 1)
    }
  }

  let ready
  return collection.onSnapshot(({ docChanges }) => {
    // console.log('pending', metadata.hasPendingWrites)
    // docs.forEach(d => console.log('doc', d, '\n', 'data', d.data()))
    docChanges.forEach(c => {
      // console.log(c)
      change[c.type](c)
    })
    if (!ready) {
      ready = true
      resolve(array)
    }
  }, err => {
    console.log('onSnapshot ERR', err)
  })
}

function bindDocument ({
  vm,
  key,
  document,
  resolve
}) {
  // TODO warning check if key exists?
  // TODO create boundRefs object
  // const boundRefs = Object.create(null)

  let ready
  return document.onSnapshot(doc => {
    // TODO extract refs
    if (doc.exists) {
      const [data] = extractRefs(createSnapshot(doc))
      vm[key] = data
    }
    if (!ready) {
      ready = true
      resolve(vm[key])
    }
    // TODO bind refs
    // const d = doc.data()
    // if (!boundRefs[d.path]) {
    //   console.log('bound ref', d.path)
    //   boundRefs[d.path] = d.onSnapshot((doc) => {
    //     console.log('ref snap', doc)
    //   }, err => console.log('onSnapshot ref ERR', err))
    // }
  }, err => {
    console.log('onSnapshot ERR', err)
  })

  // TODO return a custom unbind function that unbind all refs
}

function bind ({ vm, key, ref }) {
  return new Promise(resolve => {
    let unbind
    if (ref.where) {
      unbind = bindCollection({
        vm,
        key,
        collection: ref,
        resolve
      })
    } else {
      unbind = bindDocument({
        vm,
        key,
        document: ref,
        resolve
      })
    }
    vm._firestoreUnbinds[key] = unbind
  })
}

function install (Vue, options) {
  const strategies = Vue.config.optionMergeStrategies
  strategies.firestore = strategies.methods

  Vue.mixin({
    created () {
      const { firestore } = this.$options
      this._firestoreUnbinds = Object.create(null)
      this.$firestoreRefs = Object.create(null)
      if (!firestore) return
      Object.keys(firestore).forEach(key => {
        this.$bind(key, firestore[key])
      })
    },

    beforeDestroy () {
      Object.values(this._firestoreUnbinds).forEach(unbind => {
        unbind()
      })
      this._firestoreUnbinds = null
      this.$firestoreRefs = null
    }
  })

  // TODO test if $bind exist and warns
  Vue.prototype.$bind = function (key, ref) {
    const promise = bind({
      vm: this,
      key,
      ref
    })
    this.$firestoreRefs[key] = ref
    return promise
  }

  Vue.prototype.$unbind = function (key) {
    this._firestoreUnbinds[key]()
    delete this._firestoreUnbinds[key]
    delete this.$firestoreRefs[key]
  }
}

export default install
