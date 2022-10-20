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
import { rtdbUnbinds } from './optionsApi'

export { rtdbPlugin } from './optionsApi'

const ops: OperationsType = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1),
}

export function internalBind(
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

export function internalUnbind(
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
