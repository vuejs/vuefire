import {
  bindCollection,
  bindDocument,
  walkSet,
  firestoreOptions,
  FirestoreOptions,
  OperationsType,
} from '../core'
import * as firestore from '@firebase/firestore-types'
import {
  App,
  ComponentPublicInstance,
  getCurrentInstance,
  isVue3,
  onBeforeUnmount,
  onUnmounted,
  ref,
  Ref,
  toRef,
} from 'vue-demi'

export const ops: OperationsType = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1),
}

type UnbindType = ReturnType<typeof bindCollection | typeof bindDocument>

function internalBind<T>(
  target: Ref<T | null>,
  docRef: firestore.DocumentReference<T>,
  options?: FirestoreOptions
): [Promise<T | null>, UnbindType]
function internalBind<T>(
  target: Ref<T[]>,
  collectionRef: firestore.CollectionReference<T> | firestore.Query<T>,
  options?: FirestoreOptions
): [Promise<T[]>, UnbindType]
function internalBind<T>(
  target: Ref<T | null> | Ref<T[]>,
  docOrCollectionRef:
    | firestore.CollectionReference<T>
    | firestore.Query<T>
    | firestore.DocumentReference<T>,
  options?: FirestoreOptions
) {
  let unbind: UnbindType
  const promise = new Promise((resolve, reject) => {
    unbind = ('where' in docOrCollectionRef ? bindCollection : bindDocument)(
      target,
      // the type is good because of the ternary
      docOrCollectionRef as any,
      ops,
      resolve,
      reject,
      options
    )
  })

  return [promise, unbind!]
}

export function internalUnbind(
  key: string,
  unbinds:
    | Record<string, ReturnType<typeof bindCollection | typeof bindDocument>>
    | undefined,
  reset?: FirestoreOptions['reset']
) {
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

const firestoreUnbinds = new WeakMap<
  object,
  Record<string, ReturnType<typeof bindCollection | typeof bindDocument>>
>()

/**
 * Install this plugin to add `$bind` and `$unbind` functions. Note this plugin
 * is not necessary if you exclusively use the Composition API
 *
 * @param app
 * @param pluginOptions
 */
export const firestorePlugin = function firestorePlugin(
  app: App,
  pluginOptions: PluginOptions = defaultOptions
) {
  // const strategies = app.config.optionMergeStrategies
  // TODO: implement
  // strategies.firestore =

  const globalOptions = Object.assign({}, defaultOptions, pluginOptions)
  const { bindName, unbindName } = globalOptions

  const GlobalTarget = isVue3
    ? app.config.globalProperties
    : (app as any).prototype

  GlobalTarget[unbindName] = function firestoreUnbind(
    key: string,
    reset?: FirestoreOptions['reset']
  ) {
    internalUnbind(key, firestoreUnbinds.get(this), reset)
    delete this.$firestoreRefs[key]
  }

  GlobalTarget[bindName] = function firestoreBind(
    this: ComponentPublicInstance,
    key: string,
    docOrCollectionRef:
      | firestore.Query
      | firestore.CollectionReference
      | firestore.DocumentReference,
    userOptions?: FirestoreOptions
  ) {
    const options = Object.assign({}, globalOptions, userOptions)
    const target = toRef(this.$data as any, key)
    let unbinds = firestoreUnbinds.get(this)

    if (unbinds) {
      if (unbinds[key]) {
        unbinds[key](
          // if wait, allow overriding with a function or reset, otherwise, force reset to false
          // else pass the reset option
          options.wait
            ? typeof options.reset === 'function'
              ? options.reset
              : false
            : options.reset
        )
      }
    } else {
      firestoreUnbinds.set(this, (unbinds = {}))
    }

    const [promise, unbind] = internalBind(
      target,
      docOrCollectionRef as any,
      options
    )
    unbinds[key] = unbind
    // @ts-ignore we are allowed to write it
    this.$firestoreRefs[key] = docOrCollectionRef
    return promise
  }

  app.mixin({
    beforeCreate(this: ComponentPublicInstance) {
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
  docOrCollectionRef:
    | firestore.CollectionReference
    | firestore.Query
    | firestore.DocumentReference,
  options?: FirestoreOptions
) {
  const [promise, unbind] = internalBind(
    target,
    docOrCollectionRef as any,
    options
  )
  const unbinds = {
    '': unbind,
  }
  firestoreUnbinds.set(target, unbinds)

  // TODO: SSR serialize the values for Nuxt to expose them later and use them
  // as initial values while specifying a wait: true to only swap objects once
  // Firebase has done its initial sync. Also, on server, you don't need to
  // create sync, you can read only once the whole thing so maybe internalBind
  // should take an option like once: true to not setting up any listener

  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      unbind(options && options.reset)
    })
  }

  return promise
}

export function useFirestore<T>(
  docRef: firestore.DocumentReference<T>,
  options?: FirestoreOptions
): [Ref<T | null>, Promise<T | null>, UnbindType]
export function useFirestore<T>(
  collectionRef: firestore.Query<T> | firestore.CollectionReference<T>,
  options?: FirestoreOptions
): [Ref<T[]>, Promise<T[]>, UnbindType]
export function useFirestore<T>(
  docOrCollectionRef:
    | firestore.CollectionReference<T>
    | firestore.Query<T>
    | firestore.DocumentReference<T>,
  options?: FirestoreOptions
) {
  const target =
    'where' in docOrCollectionRef ? ref<T | null>(null) : ref<T[]>([])

  let unbind: ReturnType<typeof bindCollection | typeof bindDocument>
  const promise = new Promise((resolve, reject) => {
    unbind = ('where' in docOrCollectionRef ? bindCollection : bindDocument)(
      target,
      // the type is good because of the ternary
      docOrCollectionRef as any,
      ops,
      resolve,
      reject,
      options
    )
  })

  if (getCurrentInstance()) {
    onUnmounted(() => unbind())
  }

  return [target, promise, unbind!]
}

export const unbind = (target: Ref, reset?: FirestoreOptions['reset']) =>
  internalUnbind('', firestoreUnbinds.get(target), reset)
