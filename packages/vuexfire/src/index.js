import { createSnapshot, extractRefs, callOnceWithArg, walkGet } from './utils'
import mutations from './mutations'
import {
  VUEXFIRE_SET_VALUE,
  VUEXFIRE_ARRAY_ADD,
  VUEXFIRE_ARRAY_REMOVE,
} from './types'

export const firebaseMutations = {}
const commitOptions = { root: true }

Object.keys(mutations).forEach(type => {
  // the { commit, state, type, ...payload } syntax is not supported by buble...
  firebaseMutations[type] = (_, context) => {
    mutations[type](context.state, context)
  }
})

function unsubscribeAll (subs) {
  for (const sub in subs) {
    subs[sub].unsub()
  }
}

// NOTE not convinced by the naming of subscribeToRefs and subscribeToDocument
// first one is calling the other on every ref and subscribeToDocument may call
// updateDataFromDocumentSnapshot which may call subscribeToRefs as well
function subscribeToRefs ({
  subs,
  refs,
  target,
  path,
  data,
  depth,
  commit,
  resolve,
}, options) {
  const refKeys = Object.keys(refs)
  const missingKeys = Object.keys(subs).filter(refKey => refKeys.indexOf(refKey) < 0)
  // unbind keys that are no longer there
  missingKeys.forEach(refKey => {
    subs[refKey].unsub()
    delete subs[refKey]
  })
  if (!refKeys.length || ++depth > options.maxRefDepth) return resolve(path)

  let resolvedCount = 0
  const totalToResolve = refKeys.length
  const validResolves = Object.create(null)
  function deepResolve (key) {
    if (key in validResolves) {
      if (++resolvedCount >= totalToResolve) resolve(path)
    }
  }

  refKeys.forEach(refKey => {
    const sub = subs[refKey]
    const ref = refs[refKey]
    const docPath = `${path}.${refKey}`

    validResolves[docPath] = true

    // unsubscribe if bound to a different ref
    if (sub) {
      if (sub.path !== ref.path) sub.unsub()
      // if has already be bound and as we always walk the objects, it will work
      else return
    }

    subs[refKey] = {
      unsub: subscribeToDocument({
        ref,
        target,
        path: docPath,
        depth,
        commit,
        resolve: deepResolve.bind(null, docPath),
      }, options),
      path: ref.path,
    }
  })
}

function bindCollection ({
  vm,
  key,
  collection,
  commit,
  resolve,
  reject,
}, options) {
  commit(VUEXFIRE_SET_VALUE, {
    path: key,
    target: vm,
    data: [],
  }, commitOptions)
  const target = walkGet(vm, key)
  const originalResolve = resolve
  let isResolved

  // contain ref subscriptions of objects
  // arraySubs is a mirror of array
  const arraySubs = []

  const change = {
    added: ({ newIndex, doc }) => {
      arraySubs.splice(newIndex, 0, Object.create(null))
      const subs = arraySubs[newIndex]
      const snapshot = createSnapshot(doc)
      const [data, refs] = extractRefs(snapshot)
      commit(VUEXFIRE_ARRAY_ADD, { target, newIndex, data }, commitOptions)
      subscribeToRefs({
        data,
        refs,
        subs,
        target,
        path: newIndex,
        depth: 0,
        commit,
        resolve: resolve.bind(null, doc),
      }, options)
    },
    modified: ({ oldIndex, newIndex, doc }) => {
      const subs = arraySubs.splice(oldIndex, 1)[0]
      arraySubs.splice(newIndex, 0, subs)
      // const oldData = array.splice(oldIndex, 1)[0]
      const oldData = commit(VUEXFIRE_ARRAY_REMOVE, { target, oldIndex }, commitOptions)
      const snapshot = createSnapshot(doc)
      const [data, refs] = extractRefs(snapshot, oldData)
      // array.splice(newIndex, 0, data)
      commit(VUEXFIRE_ARRAY_ADD, { target, newIndex, data }, commitOptions)
      subscribeToRefs({
        data,
        refs,
        subs,
        target,
        path: newIndex,
        depth: 0,
        commit,
        resolve,
      }, options)
    },
    removed: ({ oldIndex }) => {
      // array.splice(oldIndex, 1)
      commit(VUEXFIRE_ARRAY_REMOVE, { target, oldIndex }, commitOptions)
      unsubscribeAll(arraySubs.splice(oldIndex, 1)[0])
    },
  }

  const unbind = collection.onSnapshot(({ docChanges }) => {
    // console.log('pending', metadata.hasPendingWrites)
    // docs.forEach(d => console.log('doc', d, '\n', 'data', d.data()))
    // NOTE this will only be triggered once and it will be with all the documents
    // from the query appearing as added
    // (https://firebase.google.com/docs/firestore/query-data/listen#view_changes_between_snapshots)
    if (!isResolved && docChanges.length) {
      // isResolved is only meant to make sure we do the check only once
      isResolved = true
      let count = 0
      const expectedItems = docChanges.length
      const validDocs = docChanges.reduce((dict, { doc }) => {
        dict[doc.id] = false
        return dict
      }, Object.create(null))
      resolve = ({ id }) => {
        if (id in validDocs) {
          if (++count >= expectedItems) {
            originalResolve(vm[key])
            // reset resolve to noop
            resolve = _ => {}
          }
        }
      }
    }
    docChanges.forEach(c => {
      change[c.type](c)
    })

    // resolves when array is empty
    if (!docChanges.length) resolve()
  }, reject)

  return () => {
    unbind()
    arraySubs.forEach(unsubscribeAll)
  }
}

function updateDataFromDocumentSnapshot ({
  snapshot,
  target,
  path,
  subs,
  depth = 0,
  commit,
  resolve,
}, options) {
  const [data, refs] = extractRefs(snapshot, walkGet(target, path))
  commit(VUEXFIRE_SET_VALUE, {
    path,
    target,
    data,
  }, commitOptions)
  subscribeToRefs({
    data,
    subs,
    refs,
    target,
    path,
    depth,
    commit,
    resolve,
  }, options)
}

function subscribeToDocument ({
  ref,
  target,
  path,
  depth,
  commit,
  resolve,
}, options) {
  const subs = Object.create(null)
  const unbind = ref.onSnapshot(doc => {
    if (doc.exists) {
      updateDataFromDocumentSnapshot({
        snapshot: createSnapshot(doc),
        target,
        path,
        subs,
        depth,
        commit,
        resolve,
      }, options)
    } else {
      commit(VUEXFIRE_SET_VALUE, {
        target,
        path,
        data: null,
      }, commitOptions)
      resolve(path)
    }
  })

  return () => {
    unbind()
    unsubscribeAll(subs)
  }
}

function bindDocument ({
  vm,
  key,
  document,
  commit,
  resolve,
  reject,
}, options) {
  // TODO warning check if key exists?
  // const boundRefs = Object.create(null)

  const subs = Object.create(null)
  // bind here the function so it can be resolved anywhere
  // this is specially useful for refs
  // TODO use walkGet?
  resolve = callOnceWithArg(resolve, () => vm[key])
  const unbind = document.onSnapshot(doc => {
    if (doc.exists) {
      updateDataFromDocumentSnapshot({
        snapshot: createSnapshot(doc),
        target: vm,
        path: key,
        subs,
        commit,
        resolve,
      }, options)
    } else {
      resolve()
    }
  }, reject)

  return () => {
    unbind()
    unsubscribeAll(subs)
  }
}

// Firebase binding
const subscriptions = new WeakMap()

function bind ({
  state,
  commit,
  key,
  ref,
}, options = { maxRefDepth: 2 }) {
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
    sub[key] = ref.where
      ? bindCollection({
        vm: state,
        key,
        collection: ref,
        commit,
        resolve,
        reject,
      }, options)
      : bindDocument({
        vm: state,
        key,
        document: ref,
        commit,
        resolve,
        reject,
      }, options)
  })
}

function unbind ({
  commit,
  key,
}) {
  let sub = subscriptions.get(commit)
  if (!sub) return
  // TODO dev check before
  sub[key]()
  delete sub[key]
}

export function firebaseAction (action) {
  return function firebaseEnhancedActionFn (context, payload) {
    // get the local state and commit. These may be bound to a module
    const { state, commit } = context
    context.bindFirebaseRef = (key, ref, options = {}) =>
      bind({ state, commit, key, ref }, options)
    context.unbindFirebaseRef = (key) =>
      unbind({ commit, key })
    return action(context, payload)
  }
}
