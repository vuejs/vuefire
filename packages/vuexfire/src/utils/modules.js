/**
 * Returns the module name of a given key
 * getModuleFromKey('items') => ''
 * getModuleFromKey('cart.items') => 'cart'
 * getModuleFromKey('user.cart.items') => 'user/cart'
 *
 * @param {string} key
 * @return {string} module name
 */
exports.getModuleFromKey = function getModuleFromKey (key) {
  var keys = key.split('.')
  return keys.slice(0, keys.length - 1).reduce(function (module, sub) {
    return module ? module + '/' + sub : sub
  }, '')
}

/**
 * Returns the key of a module + key string
 * getKey('items') => 'items'
 * getKey('cart.items') => 'items'
 * getKey('user.cart.items') => 'items'
 *
 * @param {string} key
 * @return {string} key as defined in the state
 */
exports.getKey = function getKey (key) {
  var keys = key.split('.')
  return keys[keys.length - 1] || ''
}
