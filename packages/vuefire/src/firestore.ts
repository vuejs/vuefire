import {
  bindCollection,
  bindDocument,
  walkSet,
  firestoreOptions,
  FirestoreOptions,
  OperationsType,
} from '@posva/vuefire-core'
import { firestore } from 'firebase'
import Vue, { PluginFunction } from 'vue'

const ops: OperationsType = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1),
}

function bind(
  vm: Record<string, any>,
  key: string,
  ref: firestore.CollectionReference | firestore.Query | firestore.DocumentReference,
  ops: OperationsType,
  options: FirestoreOptions
) {
  return new Promise((resolve, reject) => {
    let unbind
    if ('where' in ref) {
      unbind = bindCollection(
        {
          vm,
          key,
          ops,
          collection: ref,
          resolve,
          reject,
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
          reject,
        },
        options
      )
    }
    vm._firestoreUnbinds[key] = unbind
  })
}

interface PluginOptions {
  bindName?: string
  unbindName?: string
  serialize?: FirestoreOptions['serialize']
  reset?: FirestoreOptions['reset']
  wait?: FirestoreOptions['wait']
}

const defaultOptions: Readonly<Required<PluginOptions>> = {
  bindName: '$bind',
  unbindName: '$unbind',
  serialize: firestoreOptions.serialize,
  reset: firestoreOptions.reset,
  wait: firestoreOptions.wait,
}

declare module 'vue/types/vue' {
  // TODO: export types to allow custom function names
  interface Vue {
    $bind(
      name: string,
      reference: firestore.Query | firestore.CollectionReference,
      options?: FirestoreOptions
    ): Promise<firestore.DocumentData[]>
    $bind(
      name: string,
      reference: firestore.DocumentReference,
      options?: FirestoreOptions
    ): Promise<firestore.DocumentData>
    $unbind: (name: string, reset?: FirestoreOptions['reset']) => void
    $firestoreRefs: Readonly<
      Record<string, firestore.DocumentReference | firestore.CollectionReference>
    >
    // _firestoreSources: Readonly<
    //   Record<string, firestore.CollectionReference | firestore.Query | firestore.DocumentReference>
    // >
    _firestoreUnbinds: Readonly<
      Record<string, ReturnType<typeof bindCollection | typeof bindDocument>>
    >
  }
}

type VueFirestoreObject = Record<
  string,
  firestore.DocumentReference | firestore.Query | firestore.CollectionReference
>
type FirestoreOption<V> = VueFirestoreObject | ((this: V) => VueFirestoreObject)

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    firestore?: FirestoreOption<V>
  }
}

export const firestorePlugin: PluginFunction<PluginOptions> = function firestorePlugin(
  Vue,
  pluginOptions = defaultOptions
) {
  const strategies = Vue.config.optionMergeStrategies
  strategies.firestore = strategies.provide

  const globalOptions = Object.assign({}, defaultOptions, pluginOptions)
  const { bindName, unbindName } = globalOptions

  Vue.prototype[unbindName] = function firestoreUnbind(
    key: string,
    reset?: FirestoreOptions['reset']
  ) {
    this._firestoreUnbinds[key](reset)
    delete this._firestoreUnbinds[key]
    delete this.$firestoreRefs[key]
  }

  Vue.prototype[bindName] = function firestoreBind(
    this: Vue,
    key: string,
    ref: firestore.Query | firestore.CollectionReference | firestore.DocumentReference,
    userOptions?: FirestoreOptions
  ) {
    const options = Object.assign({}, globalOptions, userOptions)

    if (this._firestoreUnbinds[key]) {
      this[unbindName as keyof Vue](
        key,
        // if wait, allow overriding with a function or reset, otherwise, force reset to false
        // else pass the reset option
        options.wait ? (typeof options.reset === 'function' ? options.reset : false) : options.reset
      )
    }
    const promise = bind(this, key, ref, ops, options)
    // @ts-ignore we are allowed to write it
    this.$firestoreRefs[key] = ref
    return promise
  }

  Vue.mixin({
    beforeCreate(this: Vue) {
      this._firestoreUnbinds = Object.create(null)
      this.$firestoreRefs = Object.create(null)
    },
    created(this: Vue) {
      const { firestore } = this.$options
      const refs = typeof firestore === 'function' ? firestore.call(this) : firestore
      if (!refs) return
      for (const key in refs) {
        this[bindName as keyof Vue](key, refs[key], globalOptions)
      }
    },

    beforeDestroy(this: Vue) {
      for (const subKey in this._firestoreUnbinds) {
        this._firestoreUnbinds[subKey]()
      }
      // @ts-ignore we are allowed to write it
      this._firestoreUnbinds = null
      // @ts-ignore we are allowed to write it
      this.$firestoreRefs = null
    },
  })
}
