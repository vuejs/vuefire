import {
  createSnapshot,
  extractRefs,
  firestoreDefaultConverter,
  FirestoreSerializer,
} from './utils'
import { walkGet, callOnceWithArg, OperationsType, _MaybeRef } from '../shared'
import { isRef, ref, Ref, unref, watch } from 'vue-demi'
import type {
  CollectionReference,
  DocumentChange,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FirestoreDataConverter,
  Query,
  SnapshotListenOptions,
  SnapshotOptions,
} from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'

export interface FirestoreOptions {
  maxRefDepth?: number
  reset?: boolean | (() => any)

  // FIXME: should only be possible in global options
  converter?: FirestoreDataConverter<unknown>

  initialValue?: unknown

  snapshotOptions?: SnapshotOptions

  /**
   * @inheritDoc {SnapshotListenOptions}
   */
  snapshotListenOptions?: SnapshotListenOptions

  wait?: boolean
}

export interface _GlobalFirestoreOptions extends FirestoreOptions {
  maxRefDepth: number
  reset: boolean | (() => any)
  converter: FirestoreDataConverter<unknown>
  wait: boolean
}

export interface VueFireFirestoreOptions extends FirestoreOptions {
  converter?: FirestoreDataConverter<unknown>
}

const DEFAULT_OPTIONS: _GlobalFirestoreOptions = {
  maxRefDepth: 2,
  reset: true,
  converter: firestoreDefaultConverter,
  wait: false,
}
export { DEFAULT_OPTIONS as firestoreOptions }

interface FirestoreSubscription {
  unsub: () => void
  // Firestore unique key eg: items/12
  path: string
  data: () => DocumentData | null
  // // path inside the object to access the data items.3
  // key: string
}

function unsubscribeAll(subs: Record<string, FirestoreSubscription>) {
  for (const sub in subs) {
    subs[sub].unsub()
  }
}

function updateDataFromDocumentSnapshot<T>(
  options: _GlobalFirestoreOptions,
  target: Ref<T>,
  path: string,
  snapshot: DocumentSnapshot<T>,
  subs: Record<string, FirestoreSubscription>,
  ops: CommonBindOptionsParameter['ops'],
  depth: number,
  resolve: CommonBindOptionsParameter['resolve']
) {
  const [data, refs] = extractRefs(
    // @ts-expect-error: FIXME: use better types
    // Pass snapshot options
    snapshot.data(),
    walkGet(target, path),
    subs
  )
  ops.set(target, path, data)
  subscribeToRefs(options, target, path, subs, refs, ops, depth, resolve)
}

interface SubscribeToDocumentParamater {
  target: CommonBindOptionsParameter['target']
  path: string
  depth: number
  resolve: () => void
  ops: CommonBindOptionsParameter['ops']
  ref: DocumentReference
}

function subscribeToDocument(
  { ref, target, path, depth, resolve, ops }: SubscribeToDocumentParamater,
  options: _GlobalFirestoreOptions
) {
  const subs = Object.create(null)
  const unbind = onSnapshot(ref, (snapshot) => {
    if (snapshot.exists()) {
      updateDataFromDocumentSnapshot(
        options,
        target,
        path,
        snapshot,
        subs,
        ops,
        depth,
        resolve
      )
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

// interface SubscribeToRefsParameter {
//   subs: Record<string, FirestoreSubscription>
//   target: CommonBindOptionsParameter['vm']
//   refs: Record<string, DocumentReference>
//   path: string | number
//   depth: number
//   resolve: CommonBindOptionsParameter['resolve']
//   ops: CommonBindOptionsParameter['ops']
// }

// NOTE: not convinced by the naming of subscribeToRefs and subscribeToDocument
// first one is calling the other on every ref and subscribeToDocument may call
// updateDataFromDocumentSnapshot which may call subscribeToRefs as well
function subscribeToRefs(
  options: _GlobalFirestoreOptions,
  target: CommonBindOptionsParameter['target'],
  path: string | number,
  subs: Record<string, FirestoreSubscription>,
  refs: Record<string, DocumentReference>,
  ops: CommonBindOptionsParameter['ops'],
  depth: number,
  resolve: CommonBindOptionsParameter['resolve']
) {
  const refKeys = Object.keys(refs)
  const missingKeys = Object.keys(subs).filter(
    (refKey) => refKeys.indexOf(refKey) < 0
  )
  // unbind keys that are no longer there
  missingKeys.forEach((refKey) => {
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

  refKeys.forEach((refKey) => {
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

// TODO: get rid of the any
interface CommonBindOptionsParameter {
  // vm: Record<string, any>
  target: Ref<any>
  // key: string
  // Override this property in necessary functions
  resolve: (value: any) => void
  reject: (error: any) => void
  ops: OperationsType
}

export function bindCollection<T = unknown>(
  target: CommonBindOptionsParameter['target'],
  collection: CollectionReference<T> | Query<T>,
  ops: CommonBindOptionsParameter['ops'],
  resolve: CommonBindOptionsParameter['resolve'],
  reject: CommonBindOptionsParameter['reject'],
  extraOptions?: FirestoreOptions
) {
  // FIXME: can be removed now
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions) // fill default values

  const { snapshotListenOptions, snapshotOptions, wait } = options

  const key = 'value'
  if (!wait) ops.set(target, key, [])
  let arrayRef = ref(wait ? [] : target[key])
  const originalResolve = resolve
  let isResolved: boolean

  // contain ref subscriptions of objects
  // arraySubs is a mirror of array
  const arraySubs: Record<string, FirestoreSubscription>[] = []

  const change = {
    added: ({ newIndex, doc }: DocumentChange<T>) => {
      arraySubs.splice(newIndex, 0, Object.create(null))
      const subs = arraySubs[newIndex]
      const [data, refs] = extractRefs(
        // @ts-expect-error: FIXME: wrong cast, needs better types
        doc.data(snapshotOptions),
        undefined,
        subs
      )
      ops.add(unref(arrayRef), newIndex, data)
      subscribeToRefs(
        options,
        arrayRef,
        `${key}.${newIndex}`,
        subs,
        refs,
        ops,
        0,
        resolve.bind(null, doc)
      )
    },
    modified: ({ oldIndex, newIndex, doc }: DocumentChange<T>) => {
      const array = unref(arrayRef)
      const subs = arraySubs[oldIndex]
      const oldData = array[oldIndex]
      // @ts-expect-error: FIXME: Better types
      const [data, refs] = extractRefs(doc.data(snapshotOptions), oldData, subs)
      // only move things around after extracting refs
      // only move things around after extracting refs
      arraySubs.splice(newIndex, 0, subs)
      ops.remove(array, oldIndex)
      ops.add(array, newIndex, data)
      subscribeToRefs(
        options,
        arrayRef,
        `${key}.${newIndex}`,
        subs,
        refs,
        ops,
        0,
        resolve
      )
    },
    removed: ({ oldIndex }: DocumentChange<T>) => {
      const array = unref(arrayRef)
      ops.remove(array, oldIndex)
      unsubscribeAll(arraySubs.splice(oldIndex, 1)[0])
    },
  }

  const unbind = onSnapshot(
    collection,
    (snapshot) => {
      // console.log('pending', metadata.hasPendingWrites)
      // docs.forEach(d => console.log('doc', d, '\n', 'data', d.data()))
      // NOTE: this will only be triggered once and it will be with all the documents
      // from the query appearing as added
      // (https://firebase.google.com/docs/firestore/query-data/listen#view_changes_between_snapshots)

      const docChanges = snapshot.docChanges(snapshotListenOptions)

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
              if (options.wait) {
                ops.set(target, key, unref(arrayRef))
                // use the proxy object
                // arrayRef = target.value
              }
              originalResolve(unref(arrayRef))
              // reset resolve to noop
              resolve = () => {}
            }
          }
        }
      }
      docChanges.forEach((c) => {
        change[c.type](c)
      })

      // resolves when array is empty
      // since this can only happen once, there is no need to guard against it
      // being called multiple times
      if (!docChanges.length) {
        if (options.wait) {
          ops.set(target, key, unref(arrayRef))
          // use the proxy object
          // arrayRef = target.value
        }
        resolve(unref(arrayRef))
      }
    },
    reject
  )

  return (reset?: FirestoreOptions['reset']) => {
    unbind()
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : []
      ops.set(target, key, value)
    }
    arraySubs.forEach(unsubscribeAll)
  }
}

interface BindDocumentParameter extends CommonBindOptionsParameter {
  document: DocumentReference
}

/**
 * Binds a Document to a property of vm
 * @param param0
 * @param extraOptions
 */
export function bindDocument<T>(
  target: BindDocumentParameter['target'],
  document: DocumentReference<T>,
  ops: BindDocumentParameter['ops'],
  resolve: BindDocumentParameter['resolve'],
  reject: BindDocumentParameter['reject'],
  extraOptions?: FirestoreOptions
) {
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions) // fill default values
  const key = 'value'
  // TODO: warning check if key exists?
  // const boundRefs = Object.create(null)

  const subs: Record<string, FirestoreSubscription> = Object.create(null)
  // bind here the function so it can be resolved anywhere
  // this is specially useful for refs
  resolve = callOnceWithArg(resolve, () => walkGet(target, key))
  const _unbind = onSnapshot(
    document,
    (snapshot) => {
      if (snapshot.exists()) {
        updateDataFromDocumentSnapshot(
          options,
          target,
          key,
          snapshot,
          subs,
          ops,
          0,
          resolve
        )
      } else {
        ops.set(target, key, null)
        resolve(null)
      }
    },
    reject
  )

  return (reset?: FirestoreOptions['reset']) => {
    _unbind()
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : null
      ops.set(target, key, value)
    }
    unsubscribeAll(subs)
  }
}
