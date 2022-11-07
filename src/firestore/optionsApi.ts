import type {
  Query,
  CollectionReference,
  DocumentData,
  DocumentReference,
} from 'firebase/firestore'
import { App, ComponentPublicInstance, toRef } from 'vue'
import { isVue3 } from 'vue-demi'
import {
  bindCollection,
  bindDocument,
  firestoreOptions,
  FirestoreRefOptions,
  _GlobalFirestoreRefOptions,
} from './subscribe'
import { internalUnbind, _useFirestoreRef } from '.'
import { ResetOption, UnbindWithReset } from '../shared'

export type FirestoreOption = VueFirestoreObject | (() => VueFirestoreObject)

export type VueFirestoreObject = Record<
  string,
  DocumentReference | Query | CollectionReference
>

// TODO: this should be an entry point to generate the corresponding .d.ts file that only gets included if the plugin is imported

export const firestoreUnbinds = new WeakMap<
  object,
  Record<string, UnbindWithReset>
>()

/**
 * Options for the Firebase Database Plugin that enables the Options API such as `$firestoreBind` and
 * `$firestoreUnbind`.
 */
export interface FirestorePluginOptions
  extends Partial<_GlobalFirestoreRefOptions> {
  bindName?: string
  unbindName?: string
}

const firestorePluginDefaults: Readonly<
  Required<Omit<FirestorePluginOptions, keyof _GlobalFirestoreRefOptions>>
> = {
  bindName: '$firestoreBind',
  unbindName: '$firestoreUnbind',
}

/**
 * Install this plugin to add `$firestoreBind` and `$firestoreUnbind` functions. Note this plugin
 * is not necessary if you exclusively use the Composition API
 *
 * @param app
 * @param pluginOptions
 */
export const firestorePlugin = function firestorePlugin(
  app: App,
  pluginOptions?: FirestorePluginOptions
) {
  // const strategies = app.config.optionMergeStrategies
  // TODO: implement
  // strategies.firestore =

  const globalOptions = Object.assign(
    {},
    firestorePluginDefaults,
    pluginOptions
  )
  const { bindName, unbindName } = globalOptions

  const GlobalTarget = isVue3
    ? app.config.globalProperties
    : (app as any).prototype

  GlobalTarget[unbindName] = function firestoreUnbind(
    key: string,
    reset?: FirestoreRefOptions['reset']
  ) {
    internalUnbind(key, firestoreUnbinds.get(this), reset)
    delete this.$firestoreRefs[key]
  }

  GlobalTarget[bindName] = function firestoreBind(
    this: ComponentPublicInstance,
    key: string,
    docOrCollectionRef: Query | CollectionReference | DocumentReference,
    userOptions?: FirestoreRefOptions
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

    const { promise, unbind } = _useFirestoreRef(docOrCollectionRef, {
      target,
      ...options,
    })
    unbinds[key] = unbind
    // @ts-expect-error: we are allowed to write it
    this.$firestoreRefs[key] = docOrCollectionRef
    return promise.value
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
        this[bindName as '$firestoreBind'](
          key,
          // @ts-expect-error: FIXME: there is probably a wrong type in global properties
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
      // @ts-expect-error: cannot be really null but we want to remove it to avoid memory leaks
      this.$firestoreRefs = null
    },
  })
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
    $firestoreBind(
      name: string,
      // TODO: create proper overloads with generics like in the composition API
      reference: Query<unknown> | CollectionReference<unknown>,
      options?: FirestoreRefOptions
      // TODO: match the promise with the type of internalBind
    ): Promise<DocumentData[]>

    $firestoreBind(
      name: string,
      // TODO: create proper overloads with generics like in the composition API
      reference: DocumentReference<unknown>,
      options?: FirestoreRefOptions
    ): Promise<DocumentData>

    /**
     * Unbinds a bound reference
     */
    $firestoreUnbind: (name: string, reset?: ResetOption) => void

    /**
     * Bound firestore references
     */
    $firestoreRefs: Readonly<
      Record<string, DocumentReference<unknown> | CollectionReference<unknown>>
    >
    // _firestoreSources: Readonly<
    //   Record<string, CollectionReference | Query | DocumentReference>
    // >
    /**
     * Existing unbind functions that get automatically called when the component is unmounted
     * @internal
     */
    // _firestoreUnbinds: Readonly<
    //   Record<string, UnbindWithReset>
    // >
  }

  export interface ComponentCustomOptions {
    /**
     * Calls `$firestoreBind` at created
     */
    firestore?: FirestoreOption
  }
}
