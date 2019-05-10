// @ts-check
import {
  VUEXFIRE_SET_VALUE,
  VUEXFIRE_ARRAY_ADD,
  VUEXFIRE_ARRAY_REMOVE
} from '../common/types'
import { rtdbBindAsArray, rtdbBindAsObject } from '@posva/vuefire-core'

const commitOptions = { root: true }

// Firebase binding
const subscriptions = new WeakMap()

function bind ({ state, commit, key, ref, ops }, options) {
  // TODO check ref is valid
  // TODO check defined in state
  let sub = subscriptions.get(commit)
  if (!sub) {
    sub = Object.create(null)
    subscriptions.set(commit, sub)
  }

  // unbind if ref is already bound
  if (key in sub) {
    unbind({ commit, key })
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
          reject
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
          reject
        },
        options
      )
  })
}

function unbind ({ commit, key }) {
  const sub = subscriptions.get(commit)
  if (!sub || !sub[key]) return
  // TODO dev check before
  sub[key]()
  delete sub[key]
}

export function firebaseAction (action) {
  return function firebaseEnhancedActionFn (context, payload) {
    // get the local state and commit. These may be bound to a module
    const { state, commit } = context
    const ops = {
      set: (target, path, data) => {
        commit(
          VUEXFIRE_SET_VALUE,
          {
            path,
            target,
            data
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
      }
    }

    context.bindFirebaseRef = (key, ref, options) =>
      bind({ state, commit, key, ref, ops }, options)
    context.unbindFirebaseRef = key => unbind({ commit, key })
    return action(context, payload)
  }
}
