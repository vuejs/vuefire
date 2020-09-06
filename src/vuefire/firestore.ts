import {
  bindCollection,
  bindDocument,
  walkSet,
  firestoreOptions,
  FirestoreOptions,
  OperationsType,
} from '../core'
import { firestore } from 'firebase'
import { ComponentPublicInstance, Plugin } from 'vue'

const ops: OperationsType = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1),
}

function bind(
  vm: Record<string, any>,
  key: string,
  ref:
    | firestore.CollectionReference
    | firestore.Query
    | firestore.DocumentReference,
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

declare module 'vue' {
  export interface ComponentCustomProperties {
    /**
     * Binds a reference
     *
     * @param name
     * @param reference
     * @param options
     */
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

    /**
     * Unbinds a bound reference
     */
    $unbind: (name: string, reset?: FirestoreOptions['reset']) => void

    /**
     * Bound firestore references
     */
    $firestoreRefs: Readonly<
      Record<
        string,
        firestore.DocumentReference | firestore.CollectionReference
      >
    >
    // _firestoreSources: Readonly<
    //   Record<string, firestore.CollectionReference | firestore.Query | firestore.DocumentReference>
    // >
    /**
     * Existing unbind functions that get automatically called when the component is unmounted
     * @internal
     */
    _firestoreUnbinds: Readonly<
      Record<string, ReturnType<typeof bindCollection | typeof bindDocument>>
    >
  }
  export interface ComponentCustomOptions {
    /**
     * Calls `$bind` at created
     */
    firestore?: FirestoreOption
  }
}

type VueFirestoreObject = Record<
  string,
  firestore.DocumentReference | firestore.Query | firestore.CollectionReference
>
type FirestoreOption = VueFirestoreObject | (() => VueFirestoreObject)

export const firestorePlugin: Plugin = function firestorePlugin(
  app,
  pluginOptions: PluginOptions = defaultOptions
) {
  const strategies = app.config.optionMergeStrategies
  strategies.firestore = strategies.provide

  const globalOptions = Object.assign({}, defaultOptions, pluginOptions)
  const { bindName, unbindName } = globalOptions

  app.config.globalProperties[unbindName] = function firestoreUnbind(
    key: string,
    reset?: FirestoreOptions['reset']
  ) {
    this._firestoreUnbinds[key](reset)
    delete this._firestoreUnbinds[key]
    delete this.$firestoreRefs[key]
  }

  app.config.globalProperties[bindName] = function firestoreBind(
    this: ComponentPublicInstance,
    key: string,
    ref:
      | firestore.Query
      | firestore.CollectionReference
      | firestore.DocumentReference,
    userOptions?: FirestoreOptions
  ) {
    const options = Object.assign({}, globalOptions, userOptions)

    if (this._firestoreUnbinds[key]) {
      this[unbindName as '$unbind'](
        key,
        // if wait, allow overriding with a function or reset, otherwise, force reset to false
        // else pass the reset option
        options.wait
          ? typeof options.reset === 'function'
            ? options.reset
            : false
          : options.reset
      )
    }
    const promise = bind(this, key, ref, ops, options)
    // @ts-ignore we are allowed to write it
    this.$firestoreRefs[key] = ref
    return promise
  }

  app.mixin({
    beforeCreate(this: ComponentPublicInstance) {
      this._firestoreUnbinds = Object.create(null)
      this.$firestoreRefs = Object.create(null)
    },
    created(this: ComponentPublicInstance) {
      const { firestore } = this.$options
      const refs =
        typeof firestore === 'function' ? firestore.call(this) : firestore
      if (!refs) return
      for (const key in refs) {
        this[bindName as '$bind'](
          key,
          // @ts-ignore: FIXME: there is probably a wrong type in global properties
          refs[key],
          globalOptions
        )
      }
    },

    beforeDestroy(this: ComponentPublicInstance) {
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
