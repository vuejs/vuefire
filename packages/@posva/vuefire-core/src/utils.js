/**
 * @typedef {firebase.firestore.DocumentReference | firebase.firestore.CollectionReference} Reference
 */

/**
 *
 * @param {firebase.firestore.DocumentSnapshot} doc
 * @returns {DocumentData}
 */
export function createSnapshot (doc) {
  // defaults everything to false, so no need to set
  return Object.defineProperty(doc.data(), 'id', {
    value: doc.id
  })
}

/**
 *
 * @param {any} o
 * @returns {boolean}
 */
function isObject (o) {
  return o && typeof o === 'object'
}

/**
 *
 * @param {any} o
 * @returns {o is Date}
 */
function isTimestamp (o) {
  return o.toDate
}

/**
 *
 * @param {*} o
 * @returns {boolean}
 */
function isRef (o) {
  return o && o.onSnapshot
}

/**
 *
 * @param {firebase.firestore.DocumentData} doc
 * @param {firebase.firestore.DocumentData} [oldDoc]
 * @param {string} [path]
 * @param {[firebase.firestore.DocumentData, Record<string, Reference>]} result
 * @returns {[firebase.firestore.DocumentData, Record<string, Reference>]}
 */
export function extractRefs (doc, oldDoc = {}, path = '', result = [{}, {}]) {
  // must be set here because walkGet can return null or undefined
  oldDoc = oldDoc || {}
  const idDescriptor = Object.getOwnPropertyDescriptor(doc, 'id')
  if (idDescriptor && !idDescriptor.enumerable) {
    Object.defineProperty(result[0], 'id', idDescriptor)
  }
  const [data, refs] = result
  for (const key in doc) {
    const ref = doc[key]
    // if it's a ref
    if (isRef(ref)) {
      data[key] = oldDoc[key] || ref.path
      // TODO handle subpathes?
      refs[path + key] = ref
    } else if (Array.isArray(ref)) {
      // TODO handle array
      data[key] = Array(ref.length).fill(null)
      const oldArray = oldDoc[key] || []
      // Items that are no longer in the array aren't going to be processed
      const newElements = oldArray.filter(oldRef => ref.indexOf(oldRef) !== -1)
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

/**
 * @template T any
 * @template K any
 * @param {(arg: T) => K} fn
 * @param {() => T} argFn
 * @returns {() => K | undefined}
 */
export function callOnceWithArg (fn, argFn) {
  /** @type {boolean | undefined} */
  let called
  return () => {
    if (!called) {
      called = true
      return fn(argFn())
    }
  }
}

/**
 *
 * @param {Record<string, any>} obj
 * @param {string} path
 * @returns {any}
 */
export function walkGet (obj, path) {
  return path.split('.').reduce((target, key) => target[key], obj)
}

/**
 *
 * @param {Record<string, any>} obj
 * @param {string} path
 * @param {any} value
 * @returns
 */
export function walkSet (obj, path, value) {
  // path can be a number
  const keys = ('' + path).split('.')
  const key = keys.pop()
  const target = keys.reduce((target, key) => target[key], obj)
  return target.splice ? target.splice(key, 1, value) : (target[key] = value)
}

// Following utils are for RTDB

/**
 * Convert firebase RTDB snapshot into a bindable data record.
 *
 * @param {firebase.database.DataSnapshot} snapshot
 * @return {object}
 */
export function createRecordFromRTDBSnapshot (snapshot) {
  const value = snapshot.val()
  let res
  if (isObject(value)) {
    res = value
  } else {
    res = {}
    Object.defineProperty(res, '.value', {
      value
    })
  }
  Object.defineProperty(res, '.key', {
    value: snapshot.key
  })
  return res
}

/**
 * Find the index for an object with given key.
 *
 * @param {array} array
 * @param {string} key
 * @return {number}
 */
export function indexForKey (array, key) {
  for (let i = 0; i < array.length; i++) {
    if (array[i]['.key'] === key) return i
  }

  return -1
}
