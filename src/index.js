import { createSnapshot, extractRefs, callOnceWithArg, deepGetSplit } from './utils'

// NOTE not convinced by the naming of subscribeToRefs and subscribeToDocument
// first one is calling the other on every ref and subscribeToDocument may call
// updateDataFromDocumentSnapshot which may call subscribeToRefs as well
function subscribeToRefs ({
  subs,
  refs,
  target,
  key,
  data,
  depth,
  resolve
}) {
  const refKeys = Object.keys(refs)
  if (!refKeys.length) return resolve()
  // TODO check if no ref is missing
  // TODO max depth param, default to 1?
  if (++depth > 3) throw new Error('more than 5 nested refs')
  refKeys.forEach(refKey => {
    // check if already bound to the same ref -> skip
    // TODO reuse if already bound?
    const sub = subs[refKey]
    const ref = refs[refKey]

    if (sub) {
      if (sub.path !== ref.path) {
        sub.unbind()
      } else {
        // skip it as it's already bound
        // NOTE this is valid as long as target is the same
        // which is not checked anywhere but should be ok
        // because the subs object is created when needed
        return
      }
    }

    // maybe wrap the unbind function to call unbind on every child
    const [innerObj, innerKey] = deepGetSplit(target[key], refKey)
    if (!innerObj) {
      console.log('=== ERROR ===')
      console.log(data, refKey, key, innerObj, innerKey)
      console.log('===')
    }
    subs[refKey] = {
      unbind: subscribeToDocument({
        ref,
        target: innerObj,
        key: innerKey,
        depth,
        resolve
      }),
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
}) {
  // TODO wait to get all data
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
        key: newIndex,
        depth: 0,
        resolve: resolve.bind(null, doc)
      })
    },
    modified: ({ oldIndex, newIndex, doc }) => {
      array.splice(oldIndex, 1)
      array.splice(newIndex, 0, createSnapshot(doc))
      // TODO replace listeners of nested refs
    },
    removed: ({ oldIndex }) => {
      array.splice(oldIndex, 1)
      // TODO remove listeners of nested refs
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
      // console.log(c)
      change[c.type](c)
    })

    // resolves when array is empty
    if (!docChanges.length) resolve()
  }, reject)

  return () => {
    unbind()
    arraySubs.forEach(subs => {
      for (const subKey in subs) {
        subs[subKey].unbind()
      }
    })
  }
}

function updateDataFromDocumentSnapshot ({ snapshot, target, key, subs, depth = 0, resolve }) {
  const [data, refs] = extractRefs(snapshot)
  target[key] = data
  subscribeToRefs({
    data,
    subs,
    refs,
    target,
    key,
    depth,
    resolve
  })
}

function subscribeToDocument ({ ref, target, key, depth, resolve }) {
  const subs = Object.create(null)
  const unbind = ref.onSnapshot(doc => {
    if (doc.exists) {
      updateDataFromDocumentSnapshot({
        snapshot: createSnapshot(doc),
        target,
        key,
        subs,
        depth,
        resolve
      })
    } else {
      target[key] = null
      resolve()
    }
  })

  return () => {
    unbind()
    for (const subKey in subs) {
      const sub = subs[subKey]
      sub.unbind()
    }
  }
}

function bindDocument ({
  vm,
  key,
  document,
  resolve,
  reject
}) {
  // TODO warning check if key exists?
  // const boundRefs = Object.create(null)

  const subs = Object.create(null)
  // bind here the function so it can be resolved anywhere
  // this is specially useful for refs
  resolve = callOnceWithArg(resolve, () => vm[key])
  const unbind = document.onSnapshot(doc => {
    if (doc.exists) {
      updateDataFromDocumentSnapshot({
        snapshot: createSnapshot(doc),
        target: vm,
        key,
        subs,
        resolve
      })
    } else {
      resolve()
    }
  }, reject)

  // TODO return a custom unbind function that unbind all refs
  return () => {
    unbind()
    for (const subKey in subs) {
      const sub = subs[subKey]
      sub.unbind()
    }
  }
}

function bind ({ vm, key, ref }) {
  return new Promise((resolve, reject) => {
    let unbind
    if (ref.where) {
      unbind = bindCollection({
        vm,
        key,
        collection: ref,
        resolve,
        reject
      })
    } else {
      unbind = bindDocument({
        vm,
        key,
        document: ref,
        resolve,
        reject
      })
    }
    vm._firestoreUnbinds[key] = unbind
  })
}

function install (Vue, options) {
  const strategies = Vue.config.optionMergeStrategies
  strategies.firestore = strategies.provide

  Vue.mixin({
    created () {
      const { firestore } = this.$options
      this._firestoreUnbinds = Object.create(null)
      this.$firestoreRefs = Object.create(null)
      const options = typeof firestore === 'function'
        ? firestore.call(this)
        : firestore
      if (!options) return
      Object.keys(options).forEach(key => {
        this.$bind(key, options[key])
      })
    },

    beforeDestroy () {
      Object.values(this._firestoreUnbinds).forEach(unbind => {
        unbind()
      })
      this._firestoreUnbinds = null
      this.$firestoreRefs = null
    }
  })

  // TODO test if $bind exist and warns
  Vue.prototype.$bind = function (key, ref) {
    if (this._firestoreUnbinds[key]) {
      this.$unbind(key)
    }
    const promise = bind({
      vm: this,
      key,
      ref
    })
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
