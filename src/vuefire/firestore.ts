import {
  bindCollection,
  bindDocument,
  walkSet,
  firestoreOptions,
  FirestoreOptions,
  OperationsType,
} from '../core'
import { firestore } from 'firebase'
import { ComponentPublicInstance, onBeforeUnmount, Plugin, Ref } from 'vue'

export const ops: OperationsType = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1),
}

const firestoreUnbinds = new WeakMap<
  object,
  Record<string, ReturnType<typeof bindCollection | typeof bindDocument>>
>()

function internalBind(
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
    if (!firestoreUnbinds.has(vm)) {
      firestoreUnbinds.set(vm, {})
    }
    const unbinds = firestoreUnbinds.get(vm)!
    unbinds[key] = unbind
  })
}

export function internalUnbind(
  target: object,
  key: string,
  reset?: FirestoreOptions['reset']
) {
  const unbinds = firestoreUnbinds.get(target)
  if (unbinds && unbinds[key]) {
    unbinds[key](reset)
    delete unbinds[key]
  }
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

declare module '@vue/runtime-core' {
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
    // _firestoreUnbinds: Readonly<
    //   Record<string, ReturnType<typeof bindCollection | typeof bindDocument>>
    // >
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
    internalUnbind(this, key, reset)
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
    const unbinds = firestoreUnbinds.get(this)

    if (unbinds && unbinds[key]) {
      unbinds[key](
        // if wait, allow overriding with a function or reset, otherwise, force reset to false
        // else pass the reset option
        options.wait
          ? typeof options.reset === 'function'
            ? options.reset
            : false
          : options.reset
      )
      // this[unbindName as '$unbind'](
      //   key,
      //   // if wait, allow overriding with a function or reset, otherwise, force reset to false
      //   // else pass the reset option
      //   options.wait
      //     ? typeof options.reset === 'function'
      //       ? options.reset
      //       : false
      //     : options.reset
      // )
    }
    const promise = internalBind(this, key, ref, ops, options)
    // @ts-ignore we are allowed to write it
    this.$firestoreRefs[key] = ref
    return promise
  }

  app.mixin({
    beforeMount(this: ComponentPublicInstance) {
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

    beforeUnmount(this: ComponentPublicInstance) {
      const unbinds = firestoreUnbinds.get(this)
      if (unbinds) {
        for (const subKey in unbinds) {
          unbinds[subKey]()
        }
      }
      // @ts-ignore we are allowed to write it
      this.$firestoreRefs = null
    },
  })
}

// TODO: allow binding a key of a reactive object?

export function bind(
  target: Ref,
  ref:
    | firestore.CollectionReference
    | firestore.Query
    | firestore.DocumentReference,
  options: FirestoreOptions
) {
  const promise = internalBind(target, 'value', ref, ops, options)

  onBeforeUnmount(() => {
    unbind(target)
  })

  return promise
}

export const unbind = (target: Ref, reset?: FirestoreOptions['reset']) =>
  internalUnbind(target, 'value', reset)
