import { firestore } from 'firebase'
import { isTimestamp, isObject, isDocumentRef, TODO } from '../shared'

export type FirestoreReference =
  | firestore.Query
  | firestore.DocumentReference
  | firestore.CollectionReference

// TODO: fix type not to be any
export function createSnapshot(doc: firestore.DocumentSnapshot): TODO {
  // TODO: it should create a deep copy instead because otherwise we will modify internal data
  // defaults everything to false, so no need to set
  return Object.defineProperty(doc.data() || {}, 'id', { value: doc.id })
}

export type FirestoreSerializer = typeof createSnapshot

export function extractRefs(
  doc: firestore.DocumentData,
  oldDoc: firestore.DocumentData | void,
  subs: Record<string, { path: string; data: () => firestore.DocumentData | null }>
): [firestore.DocumentData, Record<string, firestore.DocumentReference>] {
  const dataAndRefs: [firestore.DocumentData, Record<string, firestore.DocumentReference>] = [
    {},
    {},
  ]

  const subsByPath = Object.keys(subs).reduce((resultSubs, subKey) => {
    const sub = subs[subKey]
    resultSubs[sub.path] = sub.data()
    return resultSubs
  }, {} as Record<string, firestore.DocumentData | null>)

  function recursiveExtract(
    doc: firestore.DocumentData,
    oldDoc: firestore.DocumentData | void,
    path: string,
    result: [firestore.DocumentData, Record<string, firestore.DocumentReference>]
  ): void {
    // make it easier to later on access the value
    oldDoc = oldDoc || {}
    const [data, refs] = result
    // Add all properties that are not enumerable (not visible in the for loop)
    // getOwnPropertyDescriptors does not exist on IE
    Object.getOwnPropertyNames(doc).forEach(propertyName => {
      const descriptor = Object.getOwnPropertyDescriptor(doc, propertyName)
      if (descriptor && !descriptor.enumerable) {
        Object.defineProperty(data, propertyName, descriptor)
      }
    })

    // recursively traverse doc to copy values and extract references
    for (const key in doc) {
      const ref = doc[key]
      if (
        // primitives
        ref == null ||
        // Firestore < 4.13
        ref instanceof Date ||
        isTimestamp(ref) ||
        (ref.longitude && ref.latitude) // GeoPoint
      ) {
        data[key] = ref
      } else if (isDocumentRef(ref)) {
        // allow values to be null (like non-existant refs)
        // TODO: better typing since this isObject shouldn't be necessary but it doesn't work
        data[key] = typeof oldDoc === 'object' && key in oldDoc ? oldDoc[key] : ref.path
        // TODO: handle subpathes?
        refs[path + key] = ref
      } else if (Array.isArray(ref)) {
        data[key] = Array(ref.length)
        // fill existing refs into data but leave the rest empty
        for (let i = 0; i < ref.length; i++) {
          const newRef = ref[i]
          // TODO: this only works with array of primitives but not with nested properties like objects with References
          if (newRef.path in subsByPath) data[key][i] = subsByPath[newRef.path]
        }
        // the oldArray is in this case the same array with holes unless the array already existed
        recursiveExtract(ref, oldDoc[key] || data[key], path + key + '.', [data[key], refs])
      } else if (isObject(ref)) {
        data[key] = {}
        recursiveExtract(ref, oldDoc[key], path + key + '.', [data[key], refs])
      } else {
        data[key] = ref
      }
    }
  }

  recursiveExtract(doc, oldDoc, '', dataAndRefs)

  return dataAndRefs
}
