import { firestore } from 'firebase'
import { isTimestamp, isObject, isDocumentRef } from '../shared'

export type FirestoreReference =
  | firestore.Query
  | firestore.DocumentReference
  | firestore.CollectionReference

export function createSnapshot(doc: firestore.DocumentSnapshot) {
  // TODO: it should create a deep copy instead because otherwise we will modify internal data
  // defaults everything to false, so no need to set
  return Object.defineProperty(doc.data() || {}, 'id', { value: doc.id })
}

export type FirestoreSerializer = typeof createSnapshot

export function extractRefs(
  doc: firestore.DocumentData,
  oldDoc: firestore.DocumentData = {},
  subs: Record<string, { path: string; data: () => firestore.DocumentData }> = {},
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
    if (isDocumentRef(ref)) {
      // allow values to be null (like non-existant refs)
      // TODO: better typing since this isObject shouldn't be necessary but it doesn't work
      data[key] = typeof oldDoc === 'object' && key in oldDoc ? oldDoc[key] : ref.path
      // TODO handle subpathes?
      refs[path + key] = ref
    } else if (Array.isArray(ref)) {
      // TODO handle array
      data[key] = Array(ref.length)
      // Items that are no longer in the array aren't going to be processed
      for (let i = 0; i < ref.length; i++) {
        const newRef = ref[i]
        const existingSub =
          subs[Object.keys(subs).find(subName => subs[subName].path === newRef.path)!]
        if (existingSub) {
          data[key][i] = existingSub.data()
        }
      }
      // the oldArray is in this case the same array with holes
      extractRefs(ref, data[key], subs, path + key + '.', [data[key], refs])
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
      extractRefs(ref, oldDoc[key], subs, path + key + '.', [data[key], refs])
    } else {
      data[key] = ref
    }
  }
  return result
}
