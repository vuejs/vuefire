import { bindCollection, bindDocument, walkSet } from '@posva/vuefire-core'

const ops = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1)
}

function bind ({ vm, key, ref, ops }, options = { maxRefDepth: 2 }) {
  return new Promise((resolve, reject) => {
    let unbind
    if (ref.where) {
      unbind = bindCollection(
        {
          vm,
          key,
          ops,
          collection: ref,
          resolve,
          reject
        },
        options
      )
    } else {
      unbind = bindDocument(
        {
          vm,
          key,
          ops,
          document: ref,
          resolve,
          reject
        },
        options
      )
    }
    vm._firestoreUnbinds[key] = unbind
  })
}

function install (Vue) {
  const strategies = Vue.config.optionMergeStrategies
  strategies.firestore = strategies.provide

  Vue.mixin({
    created () {
      const { firestore } = this.$options
      this._firestoreUnbinds = Object.create(null)
      this.$firestoreRefs = Object.create(null)
      const refs = typeof firestore === 'function' ? firestore.call(this) : firestore
      if (!refs) return
      Object.keys(refs).forEach(key => {
        this.$bind(key, refs[key])
      })
    },

    beforeDestroy () {
      for (const subKey in this._firestoreUnbinds) {
        this._firestoreUnbinds[subKey]()
      }
      this._firestoreUnbinds = null
      this.$firestoreRefs = null
    }
  })

  // TODO test if $bind exist and warns
  Vue.prototype.$bind = function (key, ref, options) {
    if (this._firestoreUnbinds[key]) {
      this.$unbind(key)
    }
    const promise = bind(
      {
        vm: this,
        key,
        ref,
        ops
      },
      options
    )
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
