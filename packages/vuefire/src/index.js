import { bindCollection, bindDocument, walkSet } from '@posva/vuefire-core'
export * from './rtdb'

const ops = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1)
}

function bind ({ vm, key, ref, ops }, options) {
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

export function firestorePlugin (
  Vue,
  { bindName = '$bind', unbindName = '$unbind' } = {}
) {
  const strategies = Vue.config.optionMergeStrategies
  strategies.firestore = strategies.provide

  Vue.mixin({
    beforeCreate () {
      this._firestoreUnbinds = Object.create(null)
      this.$firestoreRefs = Object.create(null)
    },
    created () {
      const { firestore } = this.$options
      const refs =
        typeof firestore === 'function' ? firestore.call(this) : firestore
      if (!refs) return
      Object.keys(refs).forEach(key => {
        this[bindName](key, refs[key])
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

  Vue.prototype[bindName] = function (key, ref, options) {
    if (this._firestoreUnbinds[key]) {
      this[unbindName](key)
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

  Vue.prototype[unbindName] = function (key) {
    this._firestoreUnbinds[key]()
    delete this._firestoreUnbinds[key]
    delete this.$firestoreRefs[key]
  }
}
