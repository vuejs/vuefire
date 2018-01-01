import { createSnapshot, extractRefs, callOnceWithArg, walkGet, walkSet } from './utils'

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
  resolve
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
        resolve: deepResolve.bind(null, docPath)
      }, options),
      path: ref.path
    }
  })
}

function bindCollection ({
  vm,
  key,
  collection,
  resolve,
  reject
}, options) {
  // TODO support pathes? nested.obj.list (walkSet)
  const array = vm[key] = []
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
      array.splice(newIndex, 0, data)
      subscribeToRefs({
        data,
        refs,
        subs,
        target: array,
        path: newIndex,
        depth: 0,
        resolve: resolve.bind(null, doc)
      }, options)
    },
    modified: ({ oldIndex, newIndex, doc }) => {
      const subs = arraySubs.splice(oldIndex, 1)[0]
      arraySubs.splice(newIndex, 0, subs)
      const oldData = array.splice(oldIndex, 1)[0]
      const snapshot = createSnapshot(doc)
      const [data, refs] = extractRefs(snapshot, oldData)
      array.splice(newIndex, 0, data)
      subscribeToRefs({
        data,
        refs,
        subs,
        target: array,
        path: newIndex,
        depth: 0,
        resolve
      }, options)
    },
    removed: ({ oldIndex }) => {
      array.splice(oldIndex, 1)
      unsubscribeAll(arraySubs.splice(oldIndex, 1)[0])
    }
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

function updateDataFromDocumentSnapshot ({ snapshot, target, path, subs, depth = 0, resolve }, options) {
  const [data, refs] = extractRefs(snapshot, walkGet(target, path))
  walkSet(target, path, data)
  subscribeToRefs({
    data,
    subs,
    refs,
    target,
    path,
    depth,
    resolve
  }, options)
}

function subscribeToDocument ({ ref, target, path, depth, resolve }, options) {
  const subs = Object.create(null)
  const unbind = ref.onSnapshot(doc => {
    if (doc.exists) {
      updateDataFromDocumentSnapshot({
        snapshot: createSnapshot(doc),
        target,
        path,
        subs,
        depth,
        resolve
      }, options)
    } else {
      walkSet(target, path, null)
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
  resolve,
  reject
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
        resolve
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

function bind ({ vm, key, ref }, options = { maxRefDepth: 2 }) {
  return new Promise((resolve, reject) => {
    let unbind
    if (ref.where) {
      unbind = bindCollection({
        vm,
        key,
        collection: ref,
        resolve,
        reject
      }, options)
    } else {
      unbind = bindDocument({
        vm,
        key,
        document: ref,
        resolve,
        reject
      }, options)
    }
    vm._firestoreUnbinds[key] = unbind
  })
}

function install (Vue) {
  const strategies = Vue.config.optionMergeStrategies
  strategies.firestore = strategies.provide

  Vue.mixin({
    created () {
      const { firestore } = this.$options
      this._firestoreUnbinds = Object.create(null)
      this.$firestoreRefs = Object.create(null)
      const refs = typeof firestore === 'function'
        ? firestore.call(this)
        : firestore
      if (!refs) return
      Object.keys(refs).forEach(key => {
        this.$bind(key, refs[key])
      })
    },

    beforeDestroy () {
      for (const subKey in this._firestoreUnbinds) {
        this._firestoreUnbinds[subKey]()
      }
      this._firestoreUnbinds = null
      this.$firestoreRefs = null
    }
  })

  // TODO test if $bind exist and warns
  Vue.prototype.$bind = function (key, ref, options) {
    if (this._firestoreUnbinds[key]) {
      this.$unbind(key)
    }
    const promise = bind({
      vm: this,
      key,
      ref
    }, options)
    this.$firestoreRefs[key] = ref
    return promise
  }

  Vue.prototype.$unbind = function (key) {
    this._firestoreUnbinds[key]()
    delete this._firestoreUnbinds[key]
    delete this.$firestoreRefs[key]
  }
}

export default install
