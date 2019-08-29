import { createSnapshot, extractRefs, FirestoreSerializer } from './utils'
import { walkGet, callOnceWithArg, OperationsType } from '../shared'
import { firestore } from 'firebase'

export interface FirestoreOptions {
  maxRefDepth?: number
  reset?: boolean | (() => any)
  serialize?: FirestoreSerializer
  wait?: boolean
}

// TODO: do the opposite, use optioal<> only on one function
const DEFAULT_OPTIONS: Readonly<Required<FirestoreOptions>> = {
  maxRefDepth: 2,
  reset: true,
  serialize: createSnapshot,
  wait: false,
}
export { DEFAULT_OPTIONS as firestoreOptions }

interface FirestoreSubscription {
  unsub: () => void
  path: string
}

function unsubscribeAll(subs: Record<string, FirestoreSubscription>) {
  for (const sub in subs) {
    subs[sub].unsub()
  }
}

interface UpdateDataFromDocumentSnapshot {
  readonly snapshot: firestore.DocumentSnapshot
  subs: Record<string, FirestoreSubscription>
  target: CommonBindOptionsParameter['vm']
  path: string
  depth: number
  resolve: CommonBindOptionsParameter['resolve']
  ops: CommonBindOptionsParameter['ops']
}

function updateDataFromDocumentSnapshot(
  { snapshot, target, path, subs, ops, depth, resolve }: UpdateDataFromDocumentSnapshot,
  options: Required<FirestoreOptions>
) {
  // TODO: maybe we should options.serialize the snapshot here
  const [data, refs] = extractRefs(snapshot, walkGet(target, path))
  // NOTE use ops
  ops.set(target, path, data)
  // walkSet(target, path, data)
  subscribeToRefs(
    {
      subs,
      refs,
      target,
      path,
      ops,
      depth,
      resolve,
    },
    options
  )
}

interface SubscribeToDocumentParamater {
  target: CommonBindOptionsParameter['vm']
  path: string
  depth: number
  resolve: CommonBindOptionsParameter['resolve']
  ops: CommonBindOptionsParameter['ops']
  ref: firestore.DocumentReference
}

function subscribeToDocument(
  { ref, target, path, depth, resolve, ops }: SubscribeToDocumentParamater,
  options: Required<FirestoreOptions>
) {
  const subs = Object.create(null)
  const unbind = ref.onSnapshot(doc => {
    if (doc.exists) {
      updateDataFromDocumentSnapshot(
        {
          snapshot: options.serialize(doc),
          target,
          path,
          ops,
          subs,
          depth,
          resolve,
        },
        options
      )
    } else {
      ops.set(target, path, null)
      resolve(path)
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

// NOTE not convinced by the naming of subscribeToRefs and subscribeToDocument
// first one is calling the other on every ref and subscribeToDocument may call
// updateDataFromDocumentSnapshot which may call subscribeToRefs as well
function subscribeToRefs(
  { subs, refs, target, path, depth, ops, resolve }: SubscribeToRefsParameter,
  options: Required<FirestoreOptions>
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
  // TODO: the value should either be optional or not required
  // Override this property in necessary functions
  resolve: (value?: any) => void
  reject: (error: any) => void
  ops: OperationsType
}

interface BindCollectionParamater extends CommonBindOptionsParameter {
  collection: firestore.CollectionReference | firestore.Query
}

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
      const snapshot = options.serialize(doc)
      const [data, refs] = extractRefs(snapshot)
      // NOTE use ops
      ops.add(array, newIndex, data)
      // array.splice(newIndex, 0, data)
      subscribeToRefs(
        {
          refs,
          subs,
          target: array,
          path: newIndex,
          depth: 0,
          ops,
          resolve: resolve.bind(null, doc),
        },
        options
      )
    },
    modified: ({ oldIndex, newIndex, doc }: firestore.DocumentChange) => {
      const subs = arraySubs.splice(oldIndex, 1)[0]
      arraySubs.splice(newIndex, 0, subs)
      // NOTE use ops
      const oldData = ops.remove(array, oldIndex)[0]
      // const oldData = array.splice(oldIndex, 1)[0]
      const snapshot = options.serialize(doc)
      const [data, refs] = extractRefs(snapshot, oldData)
      // NOTE use ops
      ops.add(array, newIndex, data)
      // array.splice(newIndex, 0, data)
      subscribeToRefs(
        {
          refs,
          subs,
          ops,
          target: array,
          path: newIndex,
          depth: 0,
          resolve,
        },
        options
      )
    },
    removed: ({ oldIndex }: firestore.DocumentChange) => {
      // NOTE use ops
      ops.remove(array, oldIndex)
      // array.splice(oldIndex, 1)
      unsubscribeAll(arraySubs.splice(oldIndex, 1)[0])
    },
  }

  const unbind = collection.onSnapshot(ref => {
    // console.log('pending', metadata.hasPendingWrites)
    // docs.forEach(d => console.log('doc', d, '\n', 'data', d.data()))
    // NOTE this will only be triggered once and it will be with all the documents
    // from the query appearing as added
    // (https://firebase.google.com/docs/firestore/query-data/listen#view_changes_between_snapshots)

    const docChanges =
      /* istanbul ignore next */
      typeof ref.docChanges === 'function'
        ? ref.docChanges()
        : /* istanbul ignore next to support firebase < 5*/
          ((ref.docChanges as unknown) as firestore.DocumentChange[])

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
      resolve()
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
          snapshot: options.serialize(doc),
          target: vm,
          path: key,
          subs,
          ops,
          depth: 0,
          resolve,
        },
        options
      )
    } else {
      resolve()
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
