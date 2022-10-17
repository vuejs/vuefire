import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  query,
  orderBy,
  CollectionReference,
  getDocsFromServer,
  QueryDocumentSnapshot,
  deleteDoc,
} from 'firebase/firestore'
import { afterAll } from 'vitest'
import { isCollectionRef, isDocumentRef } from '../src/shared'

export const firebaseApp = initializeApp({ projectId: 'vue-fire-store' })
export const firestore = getFirestore(firebaseApp)
connectFirestoreEmulator(firestore, 'localhost', 8080)

let _id = 0
export function setupRefs() {
  const testId = _id++
  const testsCollection = collection(firestore, `__tests`)
  const itemRef = doc(testsCollection, `item:${testId}`)
  const forItemsRef = doc(testsCollection, `forItems:${testId}`)

  const listRef = collection(forItemsRef, 'list')
  const orderedListRef = query(listRef, orderBy('name'))

  afterAll(async () => {
    // clean up the tests data
    await Promise.all([
      deleteDoc(itemRef),
      clearCollection(listRef),
      clearCollection(testsCollection),
    ])
  })

  return { itemRef, listRef, orderedListRef, testId, col: forItemsRef }
}

export async function clearCollection(collection: CollectionReference) {
  const { docs } = await getDocsFromServer(collection)
  await Promise.all(
    docs.map(doc => {
      return recursiveDeleteDoc(doc)
    })
  )
}

export async function recursiveDeleteDoc(doc: QueryDocumentSnapshot) {
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

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

// type testing utils

export function tds(_fn: () => any) {}
export function expectType<T>(_value: T): void {}
export function expectError<T>(_value: T): void {}
export function expectAssignable<T, T2 extends T = T>(_value: T2): void {}
