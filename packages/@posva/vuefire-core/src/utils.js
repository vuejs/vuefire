/**
 * @typedef {firebase.firestore.DocumentReference | firebase.firestore.CollectionReference} Reference
 */
/**
 *
 * @param {firebase.firestore.DocumentSnapshot} doc
 * @return {DocumentData}
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
 * should be o is Date https://github.com/Microsoft/TypeScript/issues/26297
 * @returns {boolean}
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
  return Object.keys(doc).reduce((tot, key) => {
    const ref = doc[key]
    // if it's a ref
    if (isRef(ref)) {
      tot[0][key] = oldDoc[key] || ref.path
      // TODO handle subpathes?
      tot[1][path + key] = ref
    } else if (Array.isArray(ref)) {
      // TODO handle array
      tot[0][key] = Array(ref.length).fill(null)
      extractRefs(ref, oldDoc[key], path + key + '.', [tot[0][key], tot[1]])
    } else if (
      ref == null ||
      // Firestore < 4.13
      ref instanceof Date ||
      isTimestamp(ref) ||
      (ref.longitude && ref.latitude) // GeoPoint
    ) {
      tot[0][key] = ref
    } else if (isObject(ref)) {
      tot[0][key] = {}
      extractRefs(ref, oldDoc[key], path + key + '.', [tot[0][key], tot[1]])
    } else {
      tot[0][key] = ref
    }
    return tot
  }, result)
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
