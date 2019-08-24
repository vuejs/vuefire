import { firestore } from 'firebase'
import { isTimestamp, isObject, isDocumentRef } from '../shared'

export type FirestoreReference =
  | firestore.Query
  | firestore.DocumentReference
  | firestore.CollectionReference

export function createSnapshot(doc: firestore.DocumentSnapshot) {
  // defaults everything to false, so no need to set
  return Object.defineProperty(doc.data(), 'id', { value: doc.id })
}

export type FirestoreSerializer = typeof createSnapshot

export function extractRefs(
  doc: firestore.DocumentData,
  oldDoc: firestore.DocumentData = {},
  path = '',
  result: [firestore.DocumentData, Record<string, firestore.DocumentReference>] = [{}, {}]
): [firestore.DocumentData, Record<string, firestore.DocumentReference>] {
  // must be set here because walkGet can return null or undefined
  oldDoc = oldDoc || {}
  const [data, refs] = result
  // TODO: this won't work if the user defines their own defined properties
  // should we do it for every non enumerable property?
  const idDescriptor = Object.getOwnPropertyDescriptor(doc, 'id')
  if (idDescriptor && !idDescriptor.enumerable) {
    Object.defineProperty(data, 'id', idDescriptor)
  }
  for (const key in doc) {
    const ref = doc[key]
    // if it's a ref
    if (isDocumentRef(ref)) {
      data[key] = oldDoc[key] || ref.path
      // TODO handle subpathes?
      refs[path + key] = ref
    } else if (Array.isArray(ref)) {
      // TODO handle array
      data[key] = Array(ref.length)
      const oldArray = oldDoc[key] || []
      // Items that are no longer in the array aren't going to be processed
      const newElements = oldArray.filter(
        // @ts-ignore FIXME:
        oldRef => ref.indexOf(oldRef) !== -1
      )
      extractRefs(ref, newElements, path + key + '.', [data[key], refs])
    } else if (
      ref == null ||
      // Firestore < 4.13
      ref instanceof Date ||
      isTimestamp(ref) ||
      (ref.longitude && ref.latitude) // GeoPoint
    ) {
      data[key] = ref
    } else if (isObject(ref)) {
      data[key] = {}
      extractRefs(ref, oldDoc[key], path + key + '.', [data[key], refs])
    } else {
      data[key] = ref
    }
  }
  return result
}
