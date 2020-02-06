import { VUEXFIRE_SET_VALUE, VUEXFIRE_ARRAY_ADD, VUEXFIRE_ARRAY_REMOVE } from './mutations-types'
import {
  bindCollection,
  bindDocument,
  OperationsType,
  FirestoreOptions,
  firestoreOptions,
} from '@posva/vuefire-core'
import { CommitFunction } from './shared'
import { firestore } from 'firebase'
import { ActionContext, Action } from 'vuex'

const commitOptions = { root: true }

export { firestoreOptions }

// Firebase binding
const subscriptions = new WeakMap()

function bind(
  state: Record<string, any>,
  commit: CommitFunction,
  key: string,
  ref: firestore.Query | firestore.CollectionReference,
  ops: OperationsType,
  options: FirestoreOptions
): Promise<firestore.DocumentData[]>
function bind(
  state: Record<string, any>,
  commit: CommitFunction,
  key: string,
  ref: firestore.DocumentReference,
  ops: OperationsType,
  options: FirestoreOptions
): Promise<firestore.DocumentData>
function bind(
  state: Record<string, any>,
  commit: CommitFunction,
  key: string,
  ref: firestore.DocumentReference | firestore.Query | firestore.CollectionReference,
  ops: OperationsType,
  options: FirestoreOptions
): Promise<firestore.DocumentData> | Promise<firestore.DocumentData[]> {
  // TODO: check ref is valid warning
  // TODO: check defined in state warning
  let sub = subscriptions.get(commit)
  if (!sub) {
    sub = Object.create(null)
    subscriptions.set(commit, sub)
  }

  // unbind if ref is already bound
  if (key in sub) {
    unbind(
      commit,
      key,
      options.wait ? (typeof options.reset === 'function' ? options.reset : false) : options.reset
    )
  }

  return new Promise((resolve, reject) => {
    sub[key] =
      'where' in ref
        ? bindCollection(
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
        : bindDocument(
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

function unbind(commit: CommitFunction, key: string, reset?: FirestoreOptions['reset']) {
  const sub = subscriptions.get(commit)
  if (!sub || !sub[key]) return
  // TODO dev check before
  sub[key](reset)
  delete sub[key]
}

interface FirestoreActionContext<S, R> extends ActionContext<S, R> {
  bindFirestoreRef(
    key: string,
    ref: firestore.Query | firestore.CollectionReference,
    options?: FirestoreOptions
  ): Promise<firestore.DocumentData[]>
  bindFirestoreRef(
    key: string,
    ref: firestore.DocumentReference,
    options?: FirestoreOptions
  ): Promise<firestore.DocumentData>
  unbindFirestoreRef(key: string): void
}

export function firestoreAction<S, R>(
  action: (context: FirestoreActionContext<S, R>, payload: any) => any
): Action<S, R> {
  return function firestoreEnhancedActionFn(context, payload) {
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
        bindFirestoreRef: (
          key: string,
          ref: firestore.DocumentReference | firestore.Query | firestore.CollectionReference,
          options?: FirestoreOptions
        ) =>
          bind(
            state,
            commit,
            key,
            // @ts-ignore
            ref,
            ops,
            Object.assign({}, firestoreOptions, options)
          ),
        unbindFirestoreRef: (key: string, reset?: FirestoreOptions['reset']) =>
          unbind(commit, key, reset),
      },
      payload
    )
  }
}
