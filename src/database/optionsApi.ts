import { DatabaseReference, DataSnapshot, Query } from 'firebase/database'
import { App, ComponentPublicInstance, toRef } from 'vue'
import { isVue3 } from 'vue-demi'
import { ResetOption, UnbindWithReset } from '../shared'
import { internalUnbind, _useDatabaseRef } from './index'
import {
  bindAsArray,
  bindAsObject,
  rtdbOptions,
  _DatabaseRefOptions,
  _GlobalDatabaseRefOptions,
} from './subscribe'

/**
 * Options for the Firebase Database Plugin that enables the Options API such as `$rtdbBind` and `$rtdbUnbind`.
 */
export interface DatabasePluginOptions
  extends Partial<_GlobalDatabaseRefOptions> {
  bindName?: string
  unbindName?: string
}

const databasePluginDefaults: Readonly<
  Required<Omit<DatabasePluginOptions, keyof _GlobalDatabaseRefOptions>>
> = {
  bindName: '$rtdbBind',
  unbindName: '$rtdbUnbind',
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
      options?: _DatabaseRefOptions
    ): Promise<DataSnapshot>

    /**
     * Unbinds a bound reference
     */
    $rtdbUnbind: (name: string, reset?: ResetOption) => void

    /**
     * Bound database references
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
    //   Record<string, UnbindWithReset>
    // >
  }
  export interface ComponentCustomOptions {
    /**
     * Calls `$rtdbBind` at created
     */
    firebase?: FirebaseOption
  }
}

export type VueFirebaseObject = Record<string, Query | DatabaseReference>
export type FirebaseOption = VueFirebaseObject | (() => VueFirebaseObject)

export const rtdbUnbinds = new WeakMap<
  object,
  Record<string, UnbindWithReset>
>()

/**
 * Install this plugin if you want to add `$rtdbBind` and `$rtdbUnbind` functions. Note this plugin is only necessary if
 * you use the Options API. If you **only use the Composition API**, you can completely skip it.
 *
 * @param app
 * @param pluginOptions
 */
export function databasePlugin(
  app: App,
  pluginOptions?: DatabasePluginOptions
) {
  // TODO: implement
  // const strategies = Vue.config.optionMergeStrategies
  // strategies.firebase = strategies.provide

  const globalOptions = Object.assign({}, databasePluginDefaults, pluginOptions)
  const { bindName, unbindName } = globalOptions

  const GlobalTarget = isVue3
    ? app.config.globalProperties
    : (app as any).prototype

  GlobalTarget[unbindName] = function rtdbUnbind(
    key: string,
    reset?: ResetOption
  ) {
    internalUnbind(key, rtdbUnbinds.get(this), reset)
    delete this.$firebaseRefs[key]
  }

  // add $rtdbBind and $rtdbUnbind methods
  GlobalTarget[bindName] = function rtdbBind(
    this: ComponentPublicInstance,
    key: string,
    source: DatabaseReference | Query,
    userOptions?: _DatabaseRefOptions
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

    // TODO: ensure creating refs outside of the scope of the component here doesn't create a memory leak
    const { promise, unbind } = _useDatabaseRef(source, { target, ...options })
    unbinds[key] = unbind

    // TODO:
    // this._firebaseSources[key] = source
    // we make it readonly for the user but we must change it. Maybe there is a way to have an internal type here but expose a readonly type through a d.ts
    ;(this.$firebaseRefs as Mutable<Record<string, DatabaseReference>>)[key] =
      source.ref

    return promise
  }

  // handle firebase option
  app.mixin({
    beforeCreate(this: ComponentPublicInstance) {
      this.$firebaseRefs = Object.create(null)
    },
    created(this: ComponentPublicInstance) {
      let bindings = this.$options.firebase
      if (typeof bindings === 'function') {
        bindings = bindings.call(this)
      }
      if (!bindings) return

      for (const key in bindings) {
        // @ts-expect-error: TODO: try fixing it
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
      // @ts-expect-error: we are freeing the memory
      this.$firebaseRefs = null
    },
  })
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] }
