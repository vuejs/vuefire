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
  /* istanbul ignore next: Fallback */
  return -1
}

/**
 * Check if a value is an object.
 *
 * @param {*} val
 * @return {boolean}
 */
export function isObject (val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}
