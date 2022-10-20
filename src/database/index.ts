import {
  rtdbBindAsArray as bindAsArray,
  rtdbBindAsObject as bindAsObject,
  rtdbOptions,
  RTDBOptions,
  walkSet,
  OperationsType,
} from '../core'
import {
  ComponentPublicInstance,
  App,
  Ref,
  toRef,
  getCurrentInstance,
  onBeforeUnmount,
  isVue3,
  ref,
  getCurrentScope,
  onScopeDispose,
} from 'vue-demi'
import type { DatabaseReference, DataSnapshot, Query } from 'firebase/database'
import { _RefWithState } from '../shared'

/**
 * Returns the original reference of a Firebase reference or query across SDK versions.
 *
 * @param refOrQuery
 */
function getRef(refOrQuery: DatabaseReference | Query): DatabaseReference {
  return refOrQuery.ref
}

const ops: OperationsType = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1),
}

function internalBind(
  target: Ref<any>,
  key: string,
  source: Query | DatabaseReference,
  unbinds: Record<string, ReturnType<typeof bindAsArray | typeof bindAsObject>>,
  options?: RTDBOptions
) {
  return new Promise((resolve, reject) => {
    let unbind
    if (Array.isArray(target.value)) {
      unbind = bindAsArray(
        {
          target,
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
          target,
          document: source,
          resolve,
          reject,
          ops,
        },
        options
      )
    }
    unbinds[key] = unbind
  })
}

function internalUnbind(
  key: string,
  unbinds:
    | Record<string, ReturnType<typeof bindAsArray | typeof bindAsObject>>
    | undefined,
  reset?: RTDBOptions['reset']
) {
  if (unbinds && unbinds[key]) {
    unbinds[key](reset)
    delete unbinds[key]
  }
  // TODO: move to $unbind
  // delete vm._firebaseSources[key]
  // delete vm._firebaseUnbinds[key]
}

interface PluginOptions {
  bindName?: string
  unbindName?: string
  serialize?: RTDBOptions['serialize']
  reset?: RTDBOptions['reset']
  wait?: RTDBOptions['wait']
}

const defaultOptions: Readonly<Required<PluginOptions>> = {
  bindName: '$rtdbBind',
  unbindName: '$rtdbUnbind',
  serialize: rtdbOptions.serialize,
  reset: rtdbOptions.reset,
  wait: rtdbOptions.wait,
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
    $rtdbBind(
      name: string,
      reference: DatabaseReference | Query,
      options?: RTDBOptions
    ): Promise<DataSnapshot>

    /**
     * Unbinds a bound reference
     */
    $rtdbUnbind: (name: string, reset?: RTDBOptions['reset']) => void

    /**
     * Bound firestore references
     */
    $firebaseRefs: Readonly<Record<string, DatabaseReference>>
    // _firebaseSources: Readonly<
    //   Record<string, Reference | Query>
    // >
    /**
     * Existing unbind functions that get automatically called when the component is unmounted
     * @internal
     */
    // _firebaseUnbinds: Readonly<
    //   Record<string, ReturnType<typeof bindAsArray | typeof bindAsObject>>
    // >
  }
  export interface ComponentCustomOptions {
    /**
     * Calls `$bind` at created
     */
    firebase?: FirebaseOption
  }
}

type VueFirebaseObject = Record<string, Query | DatabaseReference>
type FirebaseOption = VueFirebaseObject | (() => VueFirebaseObject)

const rtdbUnbinds = new WeakMap<
  object,
  Record<string, ReturnType<typeof bindAsArray | typeof bindAsObject>>
>()

/**
 * Install this plugin if you want to add `$bind` and `$unbind` functions. Note
 * this plugin is not necessary if you exclusively use the Composition API.
 *
 * @param app
 * @param pluginOptions
 */
export function rtdbPlugin(
  app: App,
  pluginOptions: PluginOptions = defaultOptions
) {
  // TODO: implement
  // const strategies = Vue.config.optionMergeStrategies
  // strategies.firebase = strategies.provide

  const globalOptions = Object.assign({}, defaultOptions, pluginOptions)
  const { bindName, unbindName } = globalOptions

  const GlobalTarget = isVue3
    ? app.config.globalProperties
    : (app as any).prototype

  GlobalTarget[unbindName] = function rtdbUnbind(
    key: string,
    reset?: RTDBOptions['reset']
  ) {
    internalUnbind(key, rtdbUnbinds.get(this), reset)
    delete this.$firebaseRefs[key]
  }

  // add $rtdbBind and $rtdbUnbind methods
  GlobalTarget[bindName] = function rtdbBind(
    this: ComponentPublicInstance,
    key: string,
    source: DatabaseReference | Query,
    userOptions?: RTDBOptions
  ) {
    const options = Object.assign({}, globalOptions, userOptions)
    const target = toRef(this.$data as any, key)
    let unbinds = rtdbUnbinds.get(this)

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
      rtdbUnbinds.set(this, (unbinds = {}))
    }

    const promise = internalBind(target, key, source, unbinds!, options)

    // TODO:
    // @ts-ignore
    // this._firebaseSources[key] = source
    this.$firebaseRefs[key] = getRef(source)

    return promise
  }

  // handle firebase option
  app.mixin({
    beforeCreate(this: ComponentPublicInstance) {
      this.$firebaseRefs = Object.create(null)
    },
    created(this: ComponentPublicInstance) {
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

    beforeUnmount(this: ComponentPublicInstance) {
      const unbinds = rtdbUnbinds.get(this)
      if (unbinds) {
        for (const key in unbinds) {
          unbinds[key]()
        }
      }
      // @ts-ignore
      this.$firebaseRefs = null
    },
  })
}

export function bind(
  target: Ref,
  reference: DatabaseReference | Query,
  options?: RTDBOptions
) {
  const unbinds = {}
  rtdbUnbinds.set(target, unbinds)
  const promise = internalBind(target, '', reference, unbinds, options)

  // TODO: SSR serialize the values for Nuxt to expose them later and use them
  // as initial values while specifying a wait: true to only swap objects once
  // Firebase has done its initial sync. Also, on server, you don't need to
  // create sync, you can read only once the whole thing so maybe internalBind
  // should take an option like once: true to not setting up any listener

  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      unbind(target, options && options.reset)
    })
  }

  return promise
}

// export function useList(reference: DatabaseReference | Query, options?: RTDBOptions)

/**
 * Creates a reactive variable connected to the database.
 *
 * @param reference - Reference or query to the database
 * @param options - optional options
 */
export function useList<T = unknown>(
  reference: DatabaseReference | Query,
  options?: RTDBOptions
): _RefWithState<T[]> {
  const unbinds = {}
  const data = ref<T[]>([]) as Ref<T[]>
  const error = ref<Error>()
  const pending = ref(true)

  rtdbUnbinds.set(data, unbinds)
  const promise = internalBind(data, '', reference, unbinds, options)
  promise
    .catch((reason) => {
      error.value = reason
    })
    .finally(() => {
      pending.value = false
    })

  // TODO: SSR serialize the values for Nuxt to expose them later and use them
  // as initial values while specifying a wait: true to only swap objects once
  // Firebase has done its initial sync. Also, on server, you don't need to
  // create sync, you can read only once the whole thing so maybe internalBind
  // should take an option like once: true to not setting up any listener

  if (getCurrentScope()) {
    onScopeDispose(() => {
      unbind(data, options && options.reset)
    })
  }

  return Object.defineProperties<_RefWithState<T[]>>(
    data as _RefWithState<T[]>,
    {
      data: { get: () => data },
      error: { get: () => error },
      pending: { get: () => error },

      promise: { get: () => promise },
    }
  )
}

export function useObject<T = unknown>(
  reference: DatabaseReference,
  options?: RTDBOptions
): _RefWithState<T | undefined> {
  const unbinds = {}
  const data = ref<T>() as Ref<T | undefined>
  const error = ref<Error>()
  const pending = ref(true)

  rtdbUnbinds.set(data, unbinds)
  const promise = internalBind(data, '', reference, unbinds, options)
  promise
    .catch((reason) => {
      error.value = reason
    })
    .finally(() => {
      pending.value = false
    })

  // TODO: SSR serialize the values for Nuxt to expose them later and use them
  // as initial values while specifying a wait: true to only swap objects once
  // Firebase has done its initial sync. Also, on server, you don't need to
  // create sync, you can read only once the whole thing so maybe internalBind
  // should take an option like once: true to not setting up any listener

  if (getCurrentScope()) {
    onScopeDispose(() => {
      unbind(data, options && options.reset)
    })
  }

  return Object.defineProperties<_RefWithState<T | undefined>>(
    data as _RefWithState<T | undefined>,
    {
      data: { get: () => data },
      error: { get: () => error },
      pending: { get: () => error },

      promise: { get: () => promise },
    }
  )
}

export const unbind = (target: Ref, reset?: RTDBOptions['reset']) =>
  internalUnbind('', rtdbUnbinds.get(target), reset)
