export function createSnapshot (doc) {
  // defaults everything to false, so no need to set
  return Object.defineProperty(doc.data(), 'id', {
    value: doc.id
  })
}

function isObject (o) {
  return o && typeof o === 'object'
}

export function extractRefs (doc, oldDoc, path = '', result = [{}, {}]) {
  // must be set here because walkGet can return null or undefined
  oldDoc = oldDoc || {}
  const idDescriptor = Object.getOwnPropertyDescriptor(doc, 'id')
  if (idDescriptor && !idDescriptor.enumerable) {
    Object.defineProperty(result[0], 'id', idDescriptor)
  }
  return Object.keys(doc).reduce((tot, key) => {
    const ref = doc[key]
    // if it's a ref
    if (ref && typeof ref.isEqual === 'function' && ref.constructor.name === 'DocumentReference') {
      tot[0][key] = oldDoc[key] || ref.path
      // TODO handle subpathes?
      tot[1][path + key] = ref
    } else if (Array.isArray(ref)) {
      // TODO handle array
      tot[0][key] = Array(ref.length).fill(null)
      extractRefs(ref, oldDoc[key], path + key + '.', [tot[0][key], tot[1]])
    } else if (
      ref instanceof Date ||
      ref == null ||
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

export function callOnceWithArg (fn, argFn) {
  let called
  return () => {
    if (!called) {
      called = true
      return fn(argFn())
    }
  }
}

export function walkGet (obj, path) {
  return path.split('.').reduce((target, key) => target[key], obj)
}

export function walkSet (obj, path, value) {
  // path can be a number
  const keys = ('' + path).split('.')
  const key = keys.pop()
  const target = keys.reduce((target, key) => target[key], obj)
  // global isFinite is different from Number.isFinite
  // it converts values to numbers
  if (isFinite(key)) target.splice(key, 1, value)
  else target[key] = value
}
