import { createSnapshot, extractRefs, FirestoreSerializer } from './utils'
import { walkGet, callOnceWithArg, OperationsType } from '../shared'
import { firestore } from 'firebase'

export interface FirestoreOptions {
  maxRefDepth?: number
  reset?: boolean | (() => any)
  serialize?: FirestoreSerializer
  wait?: boolean
}

const DEFAULT_OPTIONS: Required<FirestoreOptions> = {
  maxRefDepth: 2,
  reset: true,
  serialize: createSnapshot,
  wait: false,
}
export { DEFAULT_OPTIONS as firestoreOptions }

interface FirestoreSubscription {
  unsub: () => void
  // Firestore unique key eg: items/12
  path: string
  data: () => firestore.DocumentData | null
  // // path inside the object to access the data items.3
  // key: string
}

function unsubscribeAll(subs: Record<string, FirestoreSubscription>) {
  for (const sub in subs) {
    subs[sub].unsub()
  }
}

function updateDataFromDocumentSnapshot(
  options: Required<FirestoreOptions>,
  target: CommonBindOptionsParameter['vm'],
  path: string,
  snapshot: firestore.DocumentSnapshot,
  subs: Record<string, FirestoreSubscription>,
  ops: CommonBindOptionsParameter['ops'],
  depth: number,
  resolve: CommonBindOptionsParameter['resolve']
) {
  const [data, refs] = extractRefs(options.serialize(snapshot), walkGet(target, path), subs)
  ops.set(target, path, data)
  subscribeToRefs(options, target, path, subs, refs, ops, depth, resolve)
}

interface SubscribeToDocumentParamater {
  target: CommonBindOptionsParameter['vm']
  path: string
  depth: number
  resolve: () => void
  ops: CommonBindOptionsParameter['ops']
  ref: firestore.DocumentReference
}

function subscribeToDocument(
  { ref, target, path, depth, resolve, ops }: SubscribeToDocumentParamater,
  options: Required<FirestoreOptions>
) {
  const subs = Object.create(null)
  const unbind = ref.onSnapshot(snapshot => {
    if (snapshot.exists) {
      updateDataFromDocumentSnapshot(options, target, path, snapshot, subs, ops, depth, resolve)
    } else {
      ops.set(target, path, null)
      resolve()
    }
  })

  return () => {
    unbind()
    unsubscribeAll(subs)
  }
}

interface SubscribeToRefsParameter {
  subs: Record<string, FirestoreSubscription>
  target: CommonBindOptionsParameter['vm']
  refs: Record<string, firestore.DocumentReference>
  path: string | number
  depth: number
  resolve: CommonBindOptionsParameter['resolve']
  ops: CommonBindOptionsParameter['ops']
}

// NOTE: not convinced by the naming of subscribeToRefs and subscribeToDocument
// first one is calling the other on every ref and subscribeToDocument may call
// updateDataFromDocumentSnapshot which may call subscribeToRefs as well
function subscribeToRefs(
  options: Required<FirestoreOptions>,
  target: CommonBindOptionsParameter['vm'],
  path: string | number,
  subs: Record<string, FirestoreSubscription>,
  refs: Record<string, firestore.DocumentReference>,
  ops: CommonBindOptionsParameter['ops'],
  depth: number,
  resolve: CommonBindOptionsParameter['resolve']
) {
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
  const validResolves: Record<string, boolean> = Object.create(null)
  function deepResolve(key: string) {
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
      data: () => walkGet(target, docPath),
      unsub: subscribeToDocument(
        {
          ref,
          target,
          path: docPath,
          depth,
          ops,
          resolve: deepResolve.bind(null, docPath),
        },
        options
      ),
      path: ref.path,
    }
  })
}

interface CommonBindOptionsParameter {
  vm: Record<string, any>
  key: string
  // Override this property in necessary functions
  resolve: (value: any) => void
  reject: (error: any) => void
  ops: OperationsType
}

interface BindCollectionParamater extends CommonBindOptionsParameter {
  collection: firestore.CollectionReference | firestore.Query
}

// TODO: refactor without using an object to improve size like the other functions

export function bindCollection(
  { vm, key, collection, ops, resolve, reject }: BindCollectionParamater,
  extraOptions: FirestoreOptions = DEFAULT_OPTIONS
) {
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions) // fill default values
  // TODO support pathes? nested.obj.list (walkSet)
  const array = options.wait ? [] : ops.set(vm, key, [])
  const originalResolve = resolve
  let isResolved: boolean

  // contain ref subscriptions of objects
  // arraySubs is a mirror of array
  const arraySubs: Record<string, FirestoreSubscription>[] = []

  const change = {
    added: ({ newIndex, doc }: firestore.DocumentChange) => {
      arraySubs.splice(newIndex, 0, Object.create(null))
      const subs = arraySubs[newIndex]
      const [data, refs] = extractRefs(options.serialize(doc), undefined, subs)
      ops.add(array, newIndex, data)
      subscribeToRefs(options, array, newIndex, subs, refs, ops, 0, resolve.bind(null, doc))
    },
    modified: ({ oldIndex, newIndex, doc }: firestore.DocumentChange) => {
      const subs = arraySubs[oldIndex]
      const oldData = array[oldIndex]
      const [data, refs] = extractRefs(options.serialize(doc), oldData, subs)
      // only move things around after extracting refs
      // only move things around after extracting refs
      arraySubs.splice(newIndex, 0, subs)
      ops.remove(array, oldIndex)
      ops.add(array, newIndex, data)
      subscribeToRefs(options, array, newIndex, subs, refs, ops, 0, resolve)
    },
    removed: ({ oldIndex }: firestore.DocumentChange) => {
      ops.remove(array, oldIndex)
      unsubscribeAll(arraySubs.splice(oldIndex, 1)[0])
    },
  }

  const unbind = collection.onSnapshot(snapshot => {
    // console.log('pending', metadata.hasPendingWrites)
    // docs.forEach(d => console.log('doc', d, '\n', 'data', d.data()))
    // NOTE: this will only be triggered once and it will be with all the documents
    // from the query appearing as added
    // (https://firebase.google.com/docs/firestore/query-data/listen#view_changes_between_snapshots)

    const docChanges =
      /* istanbul ignore next */
      typeof snapshot.docChanges === 'function'
        ? snapshot.docChanges()
        : /* istanbul ignore next to support firebase < 5*/
          ((snapshot.docChanges as unknown) as firestore.DocumentChange[])

    if (!isResolved && docChanges.length) {
      // isResolved is only meant to make sure we do the check only once
      isResolved = true
      let count = 0
      const expectedItems = docChanges.length
      const validDocs = Object.create(null)
      for (let i = 0; i < expectedItems; i++) {
        validDocs[docChanges[i].doc.id] = true
      }

      resolve = ({ id }) => {
        if (id in validDocs) {
          if (++count >= expectedItems) {
            // if wait is true, finally set the array
            if (options.wait) ops.set(vm, key, array)
            originalResolve(vm[key])
            // reset resolve to noop
            resolve = () => {}
          }
        }
      }
    }
    docChanges.forEach(c => {
      change[c.type](c)
    })

    // resolves when array is empty
    // since this can only happen once, there is no need to guard against it
    // being called multiple times
    if (!docChanges.length) {
      if (options.wait) ops.set(vm, key, array)
      resolve(array)
    }
  }, reject)

  return (reset?: FirestoreOptions['reset']) => {
    unbind()
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : []
      ops.set(vm, key, value)
    }
    arraySubs.forEach(unsubscribeAll)
  }
}

interface BindDocumentParamater extends CommonBindOptionsParameter {
  document: firestore.DocumentReference
}

/**
 * Binds a Document to a property of vm
 * @param param0
 * @param extraOptions
 */
export function bindDocument(
  { vm, key, document, resolve, reject, ops }: BindDocumentParamater,
  extraOptions: FirestoreOptions = DEFAULT_OPTIONS
) {
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions) // fill default values
  // TODO: warning check if key exists?
  // const boundRefs = Object.create(null)

  const subs = Object.create(null)
  // bind here the function so it can be resolved anywhere
  // this is specially useful for refs
  resolve = callOnceWithArg(resolve, () => walkGet(vm, key))
  const unbind = document.onSnapshot(snapshot => {
    if (snapshot.exists) {
      updateDataFromDocumentSnapshot(options, vm, key, snapshot, subs, ops, 0, resolve)
    } else {
      ops.set(vm, key, null)
      resolve(null)
    }
  }, reject)

  return (reset?: FirestoreOptions['reset']) => {
    unbind()
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : null
      ops.set(vm, key, value)
    }
    unsubscribeAll(subs)
  }
}
