import { initializeApp } from 'firebase/app'
import {
  connectDatabaseEmulator,
  getDatabase,
  ref,
  query as databaseQuery,
  orderByChild,
  remove,
  push as databaseAdd,
} from 'firebase/database'
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  query as firestoreQuery,
  orderBy,
  CollectionReference,
  getDocsFromServer,
  QueryDocumentSnapshot,
  deleteDoc,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore'
import { afterAll, beforeAll } from 'vitest'
import { isCollectionRef, isDocumentRef } from '../src/shared'

export const firebaseApp = initializeApp({ projectId: 'vue-fire-store' })
export const firestore = getFirestore(firebaseApp)
export const database = getDatabase(firebaseApp)

connectFirestoreEmulator(firestore, 'localhost', 8080)
connectDatabaseEmulator(database, 'localhost', 8081)

let _id = 0

// Firestore
export function setupFirestoreRefs() {
  const testId = _id++
  const testsCollection = collection(firestore, `__tests`)
  const itemRef = doc(testsCollection)
  // let firestore generate the id
  const forItemsRef = doc(testsCollection)

  const listRef = collection(forItemsRef, 'list')
  const orderedListRef = firestoreQuery(listRef, orderBy('name'))

  afterAll(async () => {
    // clean up the tests data
    await Promise.all([
      deleteDoc(itemRef),
      ...[...docsToClean].map((doc) => deleteDoc(doc)),
    ])
    await Promise.all(
      [...collectionsToClean].map((collection) => clearCollection(collection))
    )
    // must be done after the cleanup of its docs
    await deleteDoc(forItemsRef),
      await Promise.all([
        clearCollection(listRef),
        clearCollection(testsCollection),
      ])
  })

  // for automatically generated collections
  let collectionId = 0
  const collectionsToClean = new Set<CollectionReference<any>>()
  function _collection<T = DocumentData>(
    path?: string,
    ...pathSegments: string[]
  ) {
    path = path || `col_${collectionId++}`

    const col = collection(forItemsRef, path, ...pathSegments)
    collectionsToClean.add(col)
    // to avoid having to pass a converter for types
    return col as CollectionReference<T>
  }

  // for automatically generated documents
  let docId = 0
  const docsToClean = new Set<DocumentReference<any>>()
  function _doc<T = unknown>(path?: string, ...pathSegments: string[]) {
    path = path || `doc_${docId++}`
    const d = doc(testsCollection, path, ...pathSegments)
    docsToClean.add(d)
    // to avoid having to pass a converter for types
    return d as DocumentReference<T>
  }

  return {
    itemRef,
    listRef,
    orderedListRef,
    testId,
    col: forItemsRef,
    collection: _collection,
    doc: _doc,
    query: firestoreQuery,
  }
}

async function clearCollection(collection: CollectionReference<any>) {
  const { docs } = await getDocsFromServer(collection)
  await Promise.all(
    docs.map((doc) => {
      return recursiveDeleteDoc(doc)
    })
  )
}

async function recursiveDeleteDoc(doc: QueryDocumentSnapshot<any>) {
  const docData = doc.data()
  const promises: Promise<any>[] = []
  if (docData) {
    for (const key in docData) {
      if (isCollectionRef(docData[key])) {
        promises.push(clearCollection(docData[key]))
      } else if (isDocumentRef(docData[key])) {
        promises.push(recursiveDeleteDoc(docData[key]))
      }
    }
  }
  promises.push(deleteDoc(doc.ref))
  return Promise.all(promises)
}

// Database
export function setupDatabaseRefs() {
  const testId = _id++
  const testsCollection = ref(database, `__tests_${testId}`)

  const itemRef = ref(database, testsCollection.key + `/item`)
  const listRef = ref(database, testsCollection.key + `/items`)
  const orderedListRef = databaseQuery(listRef, orderByChild('name'))

  beforeAll(async () => {
    // clean up the tests data
    await remove(testsCollection)
  })

  function databaseRef(path?: string) {
    const data = databaseAdd(testsCollection, path)
    return data.ref
  }

  return { itemRef, listRef, orderedListRef, testId, databaseRef }
}

// General utils
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// type testing utils

export function tds(_fn: () => any) {}
export function expectType<T>(_value: T): void {}
export function expectError<T>(_value: T): void {}
export function expectAssignable<T, T2 extends T = T>(_value: T2): void {}
