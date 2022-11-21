import { extractRefs, firestoreDefaultConverter } from './utils'
import {
  walkGet,
  callOnceWithArg,
  OperationsType,
  _MaybeRef,
  ResetOption,
  _DataSourceOptions,
  noop,
  _ResolveRejectFn,
} from '../shared'
import { ref, Ref, unref } from 'vue-demi'
import type {
  CollectionReference,
  DocumentChange,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FirestoreDataConverter,
  Query,
  QuerySnapshot,
  SnapshotListenOptions,
  SnapshotOptions,
} from 'firebase/firestore'
import { getDoc, getDocs } from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'

/**
 * Options when binding a Firestore document or collection.
 */
export interface FirestoreRefOptions extends _DataSourceOptions {
  /**
   * The maximum depth to bind nested refs. A nested ref that isn't bound will stay as the ref path while a bound ref
   * will contain the same data as if the ref was bound directly.
   */
  maxRefDepth?: number

  /**
   * Should the data be fetched once rather than subscribing to changes.
   * @experimental Still under development
   */
  once?: boolean

  /**
   * @inheritDoc {SnapshotOptions}
   */
  snapshotOptions?: SnapshotOptions

  /**
   * @inheritDoc {SnapshotListenOptions}
   */
  snapshotListenOptions?: SnapshotListenOptions

  /**
   * Default Firestore converter to use with snapshots.
   */
  converter?: FirestoreDataConverter<unknown>
}

/**
 * Type of the global options for firestore refs. Some values cannot be `undefined`.
 * @internal
 */
interface _DefaultsFirestoreRefOptions extends FirestoreRefOptions {
  /**
   * @defaultValue `false`
   */
  reset: ResetOption
  /**
   * @defaultValue `true`
   */
  wait: boolean

  /**
   * @defaultValue `2`
   */
  maxRefDepth: number

  /**
   * Default Firestore converter to use with snapshots.
   */
  converter: FirestoreDataConverter<unknown>
}

const DEFAULT_OPTIONS: _DefaultsFirestoreRefOptions = {
  reset: false,
  wait: true,
  maxRefDepth: 2,
  converter: firestoreDefaultConverter,
}
export { DEFAULT_OPTIONS as firestoreOptionsDefaults }

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
  options: _DefaultsFirestoreRefOptions,
  target: Ref<T>,
  path: string,
  snapshot: DocumentSnapshot<T>,
  subs: Record<string, FirestoreSubscription>,
  ops: OperationsType,
  depth: number,
  resolve: _ResolveRejectFn,
  reject: _ResolveRejectFn
) {
  const [data, refs] = extractRefs(
    // @ts-expect-error: FIXME: use better types
    // Pass snapshot options
    snapshot.data(),
    walkGet(target, path),
    subs
  )
  ops.set(target, path, data)
  subscribeToRefs(
    options,
    target,
    path,
    subs,
    refs,
    ops,
    depth,
    resolve,
    reject
  )
}

interface SubscribeToDocumentParameter {
  target: Ref<unknown>
  path: string
  depth: number
  resolve: () => void
  reject: _ResolveRejectFn
  ops: OperationsType
  ref: DocumentReference
}

function subscribeToDocument(
  {
    ref,
    target,
    path,
    depth,
    resolve,
    reject,
    ops,
  }: SubscribeToDocumentParameter,
  options: _DefaultsFirestoreRefOptions
) {
  const subs = Object.create(null)
  let unbind = noop

  if (options.once) {
    getDoc(ref).then((snapshot) => {
      if (snapshot.exists()) {
        updateDataFromDocumentSnapshot(
          options,
          target,
          path,
          snapshot,
          subs,
          ops,
          depth,
          resolve,
          reject
        )
      } else {
        ops.set(target, path, null)
        resolve()
      }
    })
    // TODO: catch?
  } else {
    unbind = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        updateDataFromDocumentSnapshot(
          options,
          target,
          path,
          snapshot,
          subs,
          ops,
          depth,
          resolve,
          reject
        )
      } else {
        ops.set(target, path, null)
        resolve()
      }
    })
  }

  return () => {
    unbind()
    unsubscribeAll(subs)
  }
}

// NOTE: not convinced by the naming of subscribeToRefs and subscribeToDocument
// first one is calling the other on every ref and subscribeToDocument may call
// updateDataFromDocumentSnapshot which may call subscribeToRefs as well
function subscribeToRefs(
  options: _DefaultsFirestoreRefOptions,
  target: Ref<unknown>,
  path: string | number,
  subs: Record<string, FirestoreSubscription>,
  refs: Record<string, DocumentReference>,
  ops: OperationsType,
  depth: number,
  resolve: _ResolveRejectFn,
  reject: _ResolveRejectFn
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
          reject,
        },
        options
      ),
      path: ref.path,
    }
  })
}

export function bindCollection<T = unknown>(
  target: Ref<unknown[]>,
  collection: CollectionReference<T> | Query<T>,
  ops: OperationsType,
  resolve: _ResolveRejectFn,
  reject: _ResolveRejectFn,
  extraOptions?: FirestoreRefOptions
) {
  // FIXME: can be removed now
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions) // fill default values

  const { snapshotListenOptions, snapshotOptions, wait } = options

  const key = 'value'
  if (!wait) ops.set(target, key, [])
  let arrayRef = ref(wait ? [] : target[key])
  const originalResolve = resolve
  let isResolved: boolean
  let stopOnSnapshot = noop

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
        resolve.bind(null, doc),
        reject
      )
    },
    modified: ({ oldIndex, newIndex, doc }: DocumentChange<T>) => {
      const array = unref(arrayRef)
      const subs = arraySubs[oldIndex]
      const oldData = array[oldIndex]
      const [data, refs] = extractRefs(
        // @ts-expect-error: FIXME: Better types
        doc.data(snapshotOptions),
        oldData,
        subs
      )
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
        resolve,
        reject
      )
    },
    removed: ({ oldIndex }: DocumentChange<T>) => {
      const array = unref(arrayRef)
      ops.remove(array, oldIndex)
      unsubscribeAll(arraySubs.splice(oldIndex, 1)[0])
    },
  }

  function onSnapshotCallback(snapshot: QuerySnapshot<T>) {
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

      resolve = (data) => {
        if (data && (data as any).id in validDocs) {
          if (++count >= expectedItems) {
            // if wait is true, finally set the array
            if (options.wait) {
              ops.set(target, key, unref(arrayRef))
              // use the proxy object
              // arrayRef = target.value
            }
            originalResolve(unref(arrayRef))
            // reset resolve to noop
            resolve = noop
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
  }

  if (options.once) {
    getDocs(collection).then(onSnapshotCallback).catch(reject)
  } else {
    stopOnSnapshot = onSnapshot(collection, onSnapshotCallback, reject)
  }

  return (reset?: FirestoreRefOptions['reset']) => {
    stopOnSnapshot()
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : []
      ops.set(target, key, value)
    }
    arraySubs.forEach(unsubscribeAll)
  }
}

/**
 * Binds a Document to a property of vm
 * @param param0
 * @param extraOptions
 */
export function bindDocument<T>(
  target: Ref<unknown>,
  document: DocumentReference<T>,
  ops: OperationsType,
  resolve: _ResolveRejectFn,
  reject: _ResolveRejectFn,
  extraOptions?: FirestoreRefOptions
) {
  const options = Object.assign({}, DEFAULT_OPTIONS, extraOptions) // fill default values
  const key = 'value'

  const subs: Record<string, FirestoreSubscription> = Object.create(null)
  // bind here the function so it can be resolved anywhere
  // this is specially useful for refs
  resolve = callOnceWithArg(resolve, () => walkGet(target, key))
  let stopOnSnapshot = noop

  function onSnapshotCallback(snapshot: DocumentSnapshot<T>) {
    if (snapshot.exists()) {
      updateDataFromDocumentSnapshot(
        options,
        target,
        key,
        snapshot,
        subs,
        ops,
        0,
        resolve,
        reject
      )
    } else {
      ops.set(target, key, null)
      resolve(null)
    }
  }

  if (options.once) {
    getDoc(document).then(onSnapshotCallback).catch(reject)
  } else {
    stopOnSnapshot = onSnapshot(document, onSnapshotCallback, reject)
  }

  return (reset?: FirestoreRefOptions['reset']) => {
    stopOnSnapshot()
    if (reset !== false) {
      const value = typeof reset === 'function' ? reset() : null
      ops.set(target, key, value)
    }
    unsubscribeAll(subs)
  }
}
