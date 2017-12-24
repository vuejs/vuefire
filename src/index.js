import { createSnapshot, extractRefs, callOnceWithArg, deepGetSplit } from './utils'

function bindCollection ({
  vm,
  key,
  collection,
  resolve,
  reject
}) {
  // TODO wait to get all data
  const array = vm[key] = []
  const depth = 0

  const change = {
    added: ({ newIndex, doc }) => {
      const subs = {}
      const snapshot = createSnapshot(doc)
      const [data, refs] = extractRefs(snapshot)
      array.splice(newIndex, 0, data)
      const refKeys = Object.keys(refs)
      if (!refKeys.length) return // resolve()
      // TODO check if no ref is missing
      // TODO max depth param, default to 1?
      // if (++depth > 3) throw new Error('more than 5 nested refs')
      refKeys.forEach(refKey => {
        // check if already bound to the same ref -> skip
        const sub = subs[refKey]
        const ref = refs[refKey]
        if (sub && sub.path !== ref.path) {
          sub.unbind()
        }
        // maybe wrap the unbind function to call unbind on every child
        const [innerObj, innerKey] = deepGetSplit(array[newIndex], refKey)
        if (!innerObj) {
          console.log('=== ERROR ===')
          console.log(data, refKey, newIndex, innerObj, innerKey)
          console.log('===')
        }
        subs[refKey] = {
          unbind: subscribeToDocument({
            ref,
            obj: innerObj,
            key: innerKey,
            depth,
            // TODO parentSubs
            resolve
          }),
          path: ref.path
        }
        // unbind currently bound ref
        // bind ref
        // save unbind callback
        // probably save key or something as well
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

  let ready
  return collection.onSnapshot(({ docChanges }) => {
    // console.log('pending', metadata.hasPendingWrites)
    // docs.forEach(d => console.log('doc', d, '\n', 'data', d.data()))
    docChanges.forEach(c => {
      // console.log(c)
      change[c.type](c)
    })
    if (!ready) {
      ready = true
      resolve(array)
    }
  }, reject)
}

function updateDataFromDocumentSnapshot ({ snapshot, obj, key, subs, depth = 0, resolve }) {
  // TODO extract refs
  const [data, refs] = extractRefs(snapshot)
  obj[key] = data
  const refKeys = Object.keys(refs)
  if (!refKeys.length) return resolve()
  // TODO check if no ref is missing
  // TODO max depth param, default to 1?
  if (++depth > 3) throw new Error('more than 5 nested refs')
  refKeys.forEach(refKey => {
    // check if already bound to the same ref -> skip
    const sub = subs[refKey]
    const ref = refs[refKey]
    if (sub && sub.path !== ref.path) {
      sub.unbind()
    }
    // maybe wrap the unbind function to call unbind on every child
    const [innerObj, innerKey] = deepGetSplit(obj[key], refKey)
    subs[refKey] = {
      unbind: subscribeToDocument({
        ref,
        obj: innerObj,
        key: innerKey,
        depth,
        // TODO parentSubs
        resolve
      }),
      path: ref.path
    }
    // unbind currently bound ref
    // bind ref
    // save unbind callback
    // probably save key or something as well
  })
}

function subscribeToDocument ({ ref, obj, key, depth, resolve }) {
  const subs = Object.create(null)
  const unbind = ref.onSnapshot(doc => {
    if (doc.exists) {
      updateDataFromDocumentSnapshot({
        snapshot: createSnapshot(doc),
        obj,
        key,
        subs,
        depth,
        resolve
      })
    } else {
      obj[key] = null
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
        obj: vm,
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
