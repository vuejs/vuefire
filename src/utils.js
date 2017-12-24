export function createSnapshot (doc) {
  // defaults everything to false, so no need to set
  return Object.defineProperty(doc.data(), 'id', {
    value: doc.id
  })
}

function isObject (o) {
  return o && typeof o === 'object'
}

export function extractRefs (doc, path = '', result = [{}, {}]) {
  return Object.keys(doc).reduce((tot, key) => {
    const ref = doc[key]
    // if it's a ref
    if (typeof ref.isEqual === 'function') {
      tot[0][key] = ref.path
      // TODO handle subpathes?
      tot[1][path + key] = ref
    } else if (Array.isArray(ref)) {
      // TODO handle array
      tot[0][key] = ref
    } else if (isObject(ref)) {
      tot[0][key] = {}
      extractRefs(ref, path + key + '.', [tot[0][key], tot[1]])
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

export function deepGetSplit (obj, path) {
  const keys = path.split('.')
  // We want the containing obj and the last key
  // key is the one we're going to bind to
  const key = keys.pop()
  return [
    keys.reduce((res, key) => {
      return res[key]
    }, obj),
    key
  ]
}
