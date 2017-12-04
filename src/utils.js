export function createSnapshot (doc) {
  // defaults everything to false, so no need to set
  return Object.defineProperty(doc.data(), 'id', {
    value: doc.id
  })
}

export function extractRefs (doc) {
  return Object.keys(doc).reduce((tot, key) => {
    const ref = doc[key]
    if (typeof ref.isEqual === 'function') {
      tot[0][key] = ref.path
      // TODO handle subpathes?
      tot[1][key] = ref
    } else {
      // TODO recursive check
      tot[0][key] = ref
    }
    return tot
  }, [{}, {}])
}
