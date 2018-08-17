import { createSnapshot, extractRefs, callOnceWithArg, walkGet, walkSet } from './utils'

function unsubscribeAll (subs) {
  for (const sub in subs) {
    subs[sub].unsub()
  }
}

// NOTE not convinced by the naming of subscribeToRefs and subscribeToDocument
// first one is calling the other on every ref and subscribeToDocument may call
// updateDataFromDocumentSnapshot which may call subscribeToRefs as well
function subscribeToRefs ({ subs, refs, target, path, data, depth, ops, resolve }, options) {
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
      unsub: subscribeToDocument(
        {
          ref,
          target,
          path: docPath,
          depth,
          ops,
          resolve: deepResolve.bind(null, docPath)
        },
        options
      ),
      path: ref.path
    }
  })
}

export function bindCollection (
  { vm, key, collection, ops, resolve, reject },
  options = { maxRefDepth: 2 }
) {
  // TODO support pathes? nested.obj.list (walkSet)
  // NOTE use ops object
  const array = ops.set(vm, key, [])
  // const array = (vm[key] = [])
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
      // NOTE use ops
      ops.add(array, newIndex, data)
      // array.splice(newIndex, 0, data)
      subscribeToRefs(
        {
          data,
          refs,
          subs,
          target: array,
          path: newIndex,
          depth: 0,
          ops,
          resolve: resolve.bind(null, doc)
        },
        options
      )
    },
    modified: ({ oldIndex, newIndex, doc }) => {
      const subs = arraySubs.splice(oldIndex, 1)[0]
      arraySubs.splice(newIndex, 0, subs)
      // NOTE use ops
      const oldData = ops.remove(array, oldIndex)[0]
      // const oldData = array.splice(oldIndex, 1)[0]
      const snapshot = createSnapshot(doc)
      const [data, refs] = extractRefs(snapshot, oldData)
      // NOTE use ops
      ops.add(array, newIndex, data)
      // array.splice(newIndex, 0, data)
      subscribeToRefs(
        {
          data,
          refs,
          subs,
          ops,
          target: array,
          path: newIndex,
          depth: 0,
          resolve
        },
        options
      )
    },
    removed: ({ oldIndex }) => {
      // NOTE use ops
      ops.remove(array, oldIndex)
      // array.splice(oldIndex, 1)
      unsubscribeAll(arraySubs.splice(oldIndex, 1)[0])
    }
  }

  const unbind = collection.onSnapshot(ref => {
    // console.log('pending', metadata.hasPendingWrites)
    // docs.forEach(d => console.log('doc', d, '\n', 'data', d.data()))
    // NOTE this will only be triggered once and it will be with all the documents
    // from the query appearing as added
    // (https://firebase.google.com/docs/firestore/query-data/listen#view_changes_between_snapshots)
    const docChanges = typeof ref.docChanges === 'function' ? ref.docChanges() : ref.docChanges

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

function updateDataFromDocumentSnapshot (
  { snapshot, target, path, subs, ops, depth = 0, resolve },
  options = { maxRefDepth: 2 }
) {
  const [data, refs] = extractRefs(snapshot, walkGet(target, path))
  // NOTE use ops
  ops.set(target, path, data)
  // walkSet(target, path, data)
  subscribeToRefs(
    {
      data,
      subs,
      refs,
      target,
      path,
      ops,
      depth,
      resolve
    },
    options
  )
}

function subscribeToDocument ({ ref, target, path, depth, resolve, ops }, options) {
  const subs = Object.create(null)
  const unbind = ref.onSnapshot(doc => {
    if (doc.exists) {
      updateDataFromDocumentSnapshot(
        {
          snapshot: createSnapshot(doc),
          target,
          path,
          ops,
          subs,
          depth,
          resolve
        },
        options
      )
    } else {
      // NOTE use ops
      ops.set(target, path, null)
      // walkSet(target, path, null)
      resolve(path)
    }
  })

  return () => {
    unbind()
    unsubscribeAll(subs)
  }
}

/* TODO do not use an object
 *
 * @param {*} vm
 * @param {string} key
 * @param {firebase.firestore.DocumentReference} document
 * @param {*} resolve
 * @param {*} reject
 * @param {OperationsType<any>} ops
 * @param {*} options
 */
export function bindDocument ({ vm, key, document, resolve, reject, ops }, options) {
  // TODO warning check if key exists?
  // const boundRefs = Object.create(null)

  const subs = Object.create(null)
  // bind here the function so it can be resolved anywhere
  // this is specially useful for refs
  // TODO use walkGet?
  resolve = callOnceWithArg(resolve, () => vm[key])
  const unbind = document.onSnapshot(doc => {
    if (doc.exists) {
      updateDataFromDocumentSnapshot(
        {
          snapshot: createSnapshot(doc),
          target: vm,
          path: key,
          subs,
          ops,
          resolve
        },
        options
      )
    } else {
      resolve()
    }
  }, reject)

  return () => {
    unbind()
    unsubscribeAll(subs)
  }
}

export { walkSet }
