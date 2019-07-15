import {
  rtdbBindAsArray as bindAsArray,
  rtdbBindAsObject as bindAsObject,
  rtdbOptions,
  RTDBOptions,
  walkSet,
  OperationsType,
} from '@posva/vuefire-core'
import { database } from 'firebase'
import Vue, { PluginFunction } from 'vue'

/**
 * Returns the original reference of a Firebase reference or query across SDK versions.
 *
 * @param {firebase.database.Reference|firebase.database.Query} refOrQuery
 * @return {firebase.database.Reference}
 */
function getRef(refOrQuery: database.Reference | database.Query): database.Reference {
  return refOrQuery.ref
}

const ops: OperationsType = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1),
}

function bind(
  vm: Record<string, any>,
  key: string,
  source: database.Query | database.Reference,
  options: RTDBOptions
) {
  return new Promise((resolve, reject) => {
    let unbind
    if (Array.isArray(vm[key])) {
      unbind = bindAsArray(
        {
          vm,
          key,
          collection: source,
          resolve,
          reject,
          ops,
        },
        options
      )
    } else {
      unbind = bindAsObject(
        {
          vm,
          key,
          document: source,
          resolve,
          reject,
          ops,
        },
        options
      )
    }
    vm._firebaseUnbinds[key] = unbind
  })
}

function unbind(vm: Record<string, any>, key: string) {
  vm._firebaseUnbinds[key]()
  delete vm._firebaseSources[key]
  delete vm._firebaseUnbinds[key]
}

interface PluginOptions {
  bindName?: string
  unbindName?: string
  serialize?: RTDBOptions['serialize']
}

const defaultOptions: Required<PluginOptions> = {
  bindName: '$rtdbBind',
  unbindName: '$rtdbUnbind',
  serialize: rtdbOptions.serialize,
}

declare module 'vue/types/vue' {
  // TODO: export types to allow custom function names
  interface Vue {
    $rtdbBind(
      name: string,
      reference: database.Reference | database.Query,
      options?: RTDBOptions
    ): Promise<database.DataSnapshot>
    $rtdbUnbind: (name: string) => void
    $firebaseRefs: Readonly<Record<string, database.Reference>>
    _firebaseSources: Readonly<Record<string, database.Reference | database.Query>>
    _firebaseUnbinds: Readonly<Record<string, () => void>>
  }
}

type VueFirebaseObject = Record<string, database.Query | database.Reference>
type FirebaseOption<V> = VueFirebaseObject | ((this: V) => VueFirebaseObject)

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    firebase?: FirebaseOption<V>
  }
}

export const rtdbPlugin: PluginFunction<PluginOptions> = function rtdbPlugin(
  Vue,
  userOptions = defaultOptions
) {
  const strategies = Vue.config.optionMergeStrategies
  strategies.firebase = strategies.provide

  const globalOptions = Object.assign({}, defaultOptions, userOptions)
  const { bindName, unbindName } = globalOptions

  // add $rtdbBind and $rtdbUnbind methods
  Vue.prototype[bindName] = function rtdbBind(
    this: Vue,
    key: string,
    source: database.Reference | database.Query,
    userOptions: RTDBOptions = globalOptions
  ) {
    const options = Object.assign({}, globalOptions, userOptions)
    if (this._firebaseUnbinds[key]) {
      // @ts-ignore
      this[unbindName](key)
    }

    const promise = bind(this, key, source, options)
    // @ts-ignore
    this._firebaseSources[key] = source
    // @ts-ignore
    this.$firebaseRefs[key] = getRef(source)

    return promise
  }

  Vue.prototype[unbindName] = function rtdbUnbind(key: string) {
    unbind(this, key)
  }

  // handle firebase option
  Vue.mixin({
    beforeCreate(this: Vue) {
      this.$firebaseRefs = Object.create(null)
      this._firebaseSources = Object.create(null)
      this._firebaseUnbinds = Object.create(null)
    },
    created(this: Vue) {
      let bindings = this.$options.firebase
      if (typeof bindings === 'function')
        bindings =
          // @ts-ignore
          bindings.call(this)
      if (!bindings) return

      for (const key in bindings) {
        // @ts-ignore
        this[bindName](key, bindings[key], globalOptions)
      }
    },

    beforeDestroy(this: Vue) {
      for (const key in this._firebaseUnbinds) {
        this._firebaseUnbinds[key]()
      }
      // @ts-ignore
      this._firebaseSources = null
      // @ts-ignore
      this._firebaseUnbinds = null
      // @ts-ignore
      this.$firebaseRefs = null
    },
  })
}
