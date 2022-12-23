import { FirebaseApp } from 'firebase/app'
import { DatabaseReference, DataSnapshot, Query } from 'firebase/database'
import { App, ComponentPublicInstance, effectScope, toRef } from 'vue-demi'
import { isVue3 } from 'vue-demi'
import { useFirebaseApp } from '../app'
import { getGlobalScope } from '../globals'
import { ResetOption, UnbindWithReset } from '../shared'
import { databaseUnbinds, internalUnbind } from './unbind'
import { _DatabaseRefOptions } from './bind'
import { _useDatabaseRef } from './useDatabaseRef'

/**
 * Options for the Firebase Database Plugin that enables the Options API such as `$databaseBind` and `$databaseUnbind`.
 */
export interface DatabasePluginOptions extends _DatabaseRefOptions {
  /**
   * @deprecated: was largely unused and not very useful. Please open an issue with use cases if you need this.
   */
  bindName?: string

  /**
   * @deprecated: was largely unused and not very useful. Please open an issue with use cases if you need this.
   */
  unbindName?: string
}

const databasePluginDefaults: Readonly<
  Required<Omit<DatabasePluginOptions, keyof _DatabaseRefOptions>>
> = {
  bindName: '$databaseBind',
  unbindName: '$databaseUnbind',
}

export type VueFirebaseObject = Record<string, Query | DatabaseReference>
export type FirebaseOption = VueFirebaseObject | (() => VueFirebaseObject)

/**
 * Install this plugin if you want to add `$databaseBind` and `$databaseUnbind` functions. Note this plugin is only necessary if
 * you use the Options API. If you **exclusively use the Composition API** (e.g. `useDatabaseObject()` and `useDatabaseList()`), you
 * should not add it.
 *
 * @deprecated Use `VueFire` and `VueFireDatabaseOptionsAPI` with the `modules` option instead.
 *
 * @param app
 * @param pluginOptions
 */
export function databasePlugin(
  app: App,
  pluginOptions?: DatabasePluginOptions,
  firebaseApp?: FirebaseApp
) {
  // TODO: implement
  // const strategies = Vue.config.optionMergeStrategies
  // strategies.firebase = strategies.provide

  const globalOptions = Object.assign({}, databasePluginDefaults, pluginOptions)
  const { bindName, unbindName } = globalOptions

  const GlobalTarget = isVue3
    ? app.config.globalProperties
    : (app as any).prototype

  GlobalTarget[unbindName] = function databaseUnbind(
    this: ComponentPublicInstance,
    key: string,
    reset?: ResetOption
  ) {
    internalUnbind(key, databaseUnbinds.get(this), reset)
    // @ts-expect-error: readonly for the users
    delete this.$firebaseRefs[key]
    // delete this._firebaseSources[key]
    // delete this._firebaseUnbinds[key]
  }

  GlobalTarget[bindName] = function databaseBind(
    this: ComponentPublicInstance,
    key: string,
    source: DatabaseReference | Query,
    userOptions?: _DatabaseRefOptions
  ) {
    const options = Object.assign({}, globalOptions, userOptions)
    const target = toRef(this.$data as any, key)
    if (!databaseUnbinds.has(this)) {
      databaseUnbinds.set(this, {})
    }
    const unbinds = databaseUnbinds.get(this)!

    if (unbinds[key]) {
      unbinds[key](options.reset)
    }

    // add the old rtdb* methods if the user was using the defaults
    if (pluginOptions) {
      if (!pluginOptions.bindName) {
        GlobalTarget['$rtdbBind'] = GlobalTarget[bindName]
      }
      if (!pluginOptions.unbindName) {
        GlobalTarget['$rtdbUnbind'] = GlobalTarget[unbindName]
      }
    }

    // we create a local scope to avoid leaking the effect since it's created outside of the component
    const scope = getGlobalScope(firebaseApp || useFirebaseApp(), app).run(() =>
      effectScope()
    )!

    const { promise, stop: _unbind } = scope.run(() =>
      _useDatabaseRef(source, { target, ...options })
    )!

    // override the unbind to also free th variables created
    const unbind: UnbindWithReset = (reset) => {
      _unbind(reset)
      scope.stop()
    }
    unbinds[key] = unbind

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
        // @ts-expect-error: bindName is a string here
        this[bindName](
          // ts
          key,
          bindings[key],
          globalOptions
        )
      }
    },

    beforeUnmount(this: ComponentPublicInstance) {
      const unbinds = databaseUnbinds.get(this)
      if (unbinds) {
        for (const key in unbinds) {
          unbinds[key]()
        }
      }
      // @ts-expect-error: we are freeing the references to avoid memory leaks
      this.$firebaseRefs = null
    },
  })
}

/**
 * VueFire Database Module to be added to the `VueFire` Vue plugin options. If you **exclusively use the Composition
 * API** (e.g. `useDatabaseObject()` and `useDatabaseList()`), you should not add it.
 *
 * @example
 *
 * ```ts
 * import { createApp } from 'vue'
 * import { VueFire, VueFireDatabaseOptionsAPI } from 'vuefire'
 *
 * const app = createApp(App)
 * app.use(VueFire, {
 *   modules: [VueFireDatabaseOptionsAPI()],
 * })
 * ```
 */
export function VueFireDatabaseOptionsAPI(
  pluginOptions?: DatabasePluginOptions
) {
  return (firebaseApp: FirebaseApp, app: App) => {
    return databasePlugin(app, pluginOptions, firebaseApp)
  }
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] }

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    /**
     * Binds a reference
     *
     * @param name
     * @param reference
     * @param options
     */
    $databaseBind(
      name: string,
      reference: DatabaseReference | Query,
      options?: _DatabaseRefOptions
    ): Promise<DataSnapshot>

    /**
     * {@inheritDoc ComponentCustomProperties.$databaseBind}
     * @deprecated Use `$databaseBind` instead.
     */
    $rtdbBind(
      name: string,
      reference: DatabaseReference | Query,
      options?: _DatabaseRefOptions
    ): Promise<DataSnapshot>

    /**
     * Unbinds a bound reference
     */
    $databaseUnbind: (name: string, reset?: ResetOption) => void

    /**
     * {@inheritDoc ComponentCustomProperties.$databaseUnbind}
     * @deprecated Use `$databaseUnbind` instead.
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
     * Calls `$databaseBind` at created
     */
    firebase?: FirebaseOption
  }
}
