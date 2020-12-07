import { VUEXFIRE_SET_VALUE, VUEXFIRE_ARRAY_ADD, VUEXFIRE_ARRAY_REMOVE } from './mutations-types'
import {
  rtdbBindAsArray,
  rtdbBindAsObject,
  OperationsType,
  RTDBOptions,
  rtdbOptions,
} from '@posva/vuefire-core'
import firebase from 'firebase/app'
import { CommitFunction } from './shared'

import { Action, ActionContext } from 'vuex'

const commitOptions = { root: true }
export { rtdbOptions }

// Firebase binding
const subscriptions = new WeakMap()

interface FirebaseActionContext<S, R> extends ActionContext<S, R> {
  bindFirebaseRef(
    key: string,
    reference: firebase.database.Reference | firebase.database.Query,
    options?: RTDBOptions
  ): Promise<firebase.database.DataSnapshot>
  unbindFirebaseRef(key: string, reset?: RTDBOptions['reset']): void
}

function bind(
  state: Record<string, any>,
  commit: CommitFunction,
  key: string,
  ref: firebase.database.Reference | firebase.database.Query,
  ops: OperationsType,
  options: RTDBOptions
): Promise<firebase.database.DataSnapshot> {
  // TODO check ref is valid
  // TODO check defined in state
  let sub = subscriptions.get(commit)
  if (!sub) {
    sub = Object.create(null)
    subscriptions.set(commit, sub)
  }

  // unbind if ref is already bound
  if (key in sub) {
    unbind(commit, key, options && options.reset)
  }

  return new Promise((resolve, reject) => {
    sub[key] = Array.isArray(state[key])
      ? rtdbBindAsArray(
          {
            vm: state,
            key,
            collection: ref,
            ops,
            resolve,
            reject,
          },
          options
        )
      : rtdbBindAsObject(
          {
            vm: state,
            key,
            document: ref,
            ops,
            resolve,
            reject,
          },
          options
        )
  })
}

function unbind(commit: CommitFunction, key: string, reset?: RTDBOptions['reset']) {
  const sub = subscriptions.get(commit)
  if (!sub || !sub[key]) return
  // TODO dev check before
  sub[key](reset)
  delete sub[key]
}

export function firebaseAction<S, R>(
  action: (context: FirebaseActionContext<S, R>, payload: any) => any
): Action<S, R> {
  return function firebaseEnhancedActionFn(context, payload) {
    // get the local state and commit. These may be bound to a module
    const { state, commit } = context
    const ops: OperationsType = {
      set: (target, path, data) => {
        commit(
          VUEXFIRE_SET_VALUE,
          {
            path,
            target,
            data,
          },
          commitOptions
        )
        return data
      },
      add: (target, newIndex, data) =>
        commit(VUEXFIRE_ARRAY_ADD, { target, newIndex, data }, commitOptions),
      remove: (target, oldIndex) => {
        const data = target[oldIndex]
        commit(VUEXFIRE_ARRAY_REMOVE, { target, oldIndex }, commitOptions)
        return [data]
      },
    }

    return action.call(
      this,
      {
        ...context,
        bindFirebaseRef: (
          key: string,
          ref: firebase.database.Reference | firebase.database.Query,
          options?: RTDBOptions
        ) => bind(state, commit, key, ref, ops, Object.assign({}, rtdbOptions, options)),
        unbindFirebaseRef: (key: string, reset?: RTDBOptions['reset']) =>
          unbind(commit, key, reset),
      },
      payload
    )
  }
}
