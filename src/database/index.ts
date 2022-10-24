import { Ref, ref, getCurrentScope, onScopeDispose } from 'vue-demi'
import type { DatabaseReference, Query } from 'firebase/database'
import { OperationsType, walkSet, _RefWithState } from '../shared'
import { rtdbUnbinds } from './optionsApi'
import { bindAsArray, bindAsObject, _DatabaseRefOptions } from './subscribe'

export { databasePlugin } from './optionsApi'

// TODO: if we allow passing them locally, we could also add the create and reset to allow creating other data structures like a Map

const ops: OperationsType = {
  set: (target, key, value) => walkSet(target, key, value),
  add: (array, index, data) => array.splice(index, 0, data),
  remove: (array, index) => array.splice(index, 1),
}

export interface _UseDatabaseRefOptions extends _DatabaseRefOptions {
  target?: Ref<unknown>
}

type UnbindType = ReturnType<typeof bindAsArray | typeof bindAsObject>

export function _useDatabaseRef(
  reference: DatabaseReference | Query,
  options: _UseDatabaseRefOptions = {}
) {
  let unbind!: UnbindType

  const data = options.target || ref<unknown | null>(options.initialValue)
  const error = ref<Error>()
  const pending = ref(true)

  const promise = new Promise((resolve, reject) => {
    if (Array.isArray(data.value)) {
      unbind = bindAsArray(
        {
          target: data,
          collection: reference,
          resolve,
          reject,
          ops,
        },
        options
      )
    } else {
      unbind = bindAsObject(
        {
          target: data,
          document: reference,
          resolve,
          reject,
          ops,
        },
        options
      )
    }
  })

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
  // create sync, you can read only once the whole thing so maybe _useDatabaseRef
  // should take an option like once: true to not setting up any listener

  if (getCurrentScope()) {
    onScopeDispose(() => {
      unbind(options.reset)
    })
  }

  return Object.defineProperties(data, {
    data: { get: () => data },
    error: { get: () => error },
    pending: { get: () => error },

    promise: { get: () => promise },
    unbind: { get: () => unbind },
  }) as _RefDatabase<unknown | null>
}

export function internalUnbind(
  key: string,
  unbinds: Record<string, UnbindType> | undefined,
  reset?: _DatabaseRefOptions['reset']
) {
  if (unbinds && unbinds[key]) {
    unbinds[key](reset)
    delete unbinds[key]
  }
  // TODO: move to $firestoreUnbind
  // delete vm._firebaseSources[key]
  // delete vm._firebaseUnbinds[key]
}

/**
 * Creates a reactive variable connected to the database.
 *
 * @param reference - Reference or query to the database
 * @param options - optional options
 */
export function useList<T = unknown>(
  reference: DatabaseReference | Query,
  options?: _DatabaseRefOptions
): _RefDatabase<T[]> {
  const unbinds = {}
  const data = ref<T[]>([]) as Ref<T[]>
  return _useDatabaseRef(reference, {
    target: data,
    ...options,
  }) as _RefDatabase<T[]>
}

export function useObject<T = unknown>(
  reference: DatabaseReference,
  options?: _DatabaseRefOptions
): _RefDatabase<T | undefined> {
  const data = ref<T>() as Ref<T | undefined>
  return _useDatabaseRef(reference, {
    target: data,
    ...options,
  }) as _RefDatabase<T | undefined>
}

export const unbind = (target: Ref, reset?: _DatabaseRefOptions['reset']) =>
  internalUnbind('', rtdbUnbinds.get(target), reset)

export interface _RefDatabase<T> extends _RefWithState<T, Error> {}
