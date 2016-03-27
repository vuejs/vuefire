let Vue // late binding

/**
 * Check if a value is an object.
 *
 * @param {*} val
 * @return {boolean}
 */
function isObject (val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

/**
 * Convert firebase snapshot into a bindable data record.
 *
 * @param {FirebaseSnapshot} snapshot
 * @return {Object}
 */
function createRecord (snapshot) {
  var value = snapshot.val()
  var res = value && typeof value === 'object'
    ? value
    : { '.value': value }
  res['.key'] = snapshot.key()
  return res
}

/**
 * Find the index for an object with given key.
 *
 * @param {array} array
 * @param {string} key
 * @return {number}
 */
function indexForKey (array, key) {
  for (var i = 0; i < array.length; i++) {
    if (array[i]['.key'] === key) {
      return i
    }
  }
  return -1
}

/**
 * Bind a firebase data source to a key on a vm.
 *
 * @param {Vue} vm
 * @param {string} key
 * @param {object} source
 */
function bind (vm, key, source) {
  if (!isObject(source)) {
    throw new Error('VueFire: invalid Firebase binding source.')
  }
  var asArray = false
  var cancelCallback = null
  // check { source, asArray, cancelCallback } syntax
  if (isObject(source.source)) {
    asArray = source.asArray
    cancelCallback = source.cancelCallback
    source = source.source
  }
  // get the original ref for possible queries
  var ref = source
  if (typeof source.ref === 'function') {
    ref = source.ref()
  }
  vm.$firebaseRefs[key] = ref
  vm._firebaseSources[key] = source
  // bind based on initial value type
  if (asArray) {
    bindAsArray(vm, key, source, cancelCallback)
  } else {
    bindAsObject(vm, key, source, cancelCallback)
  }
}

/**
 * Bind a firebase data source to a key on a vm as an Array.
 *
 * @param {Vue} vm
 * @param {string} key
 * @param {object} source
 * @param {function|null} cancelCallback
 */
function bindAsArray (vm, key, source, cancelCallback) {
  var array = []
  Vue.util.defineReactive(vm, key, array)

  var onAdd = source.on('child_added', function (snapshot, prevKey) {
    var index = prevKey ? indexForKey(array, prevKey) + 1 : 0
    array.splice(index, 0, createRecord(snapshot))
  }, cancelCallback)

  var onRemove = source.on('child_removed', function (snapshot) {
    var index = indexForKey(array, snapshot.key())
    array.splice(index, 1)
  }, cancelCallback)

  var onChange = source.on('child_changed', function (snapshot) {
    var index = indexForKey(array, snapshot.key())
    array.splice(index, 1, createRecord(snapshot))
  }, cancelCallback)

  var onMove = source.on('child_moved', function (snapshot, prevKey) {
    var index = indexForKey(array, snapshot.key())
    var record = array.splice(index, 1)[0]
    var newIndex = prevKey ? indexForKey(array, prevKey) + 1 : 0
    array.splice(newIndex, 0, record)
  }, cancelCallback)

  vm._firebaseListeners[key] = {
    child_added: onAdd,
    child_removed: onRemove,
    child_changed: onChange,
    child_moved: onMove
  }
}

/**
 * Bind a firebase data source to a key on a vm as an Object.
 *
 * @param {Vue} vm
 * @param {string} key
 * @param {Object} source
 * @param {function|null} cancelCallback
 */
function bindAsObject (vm, key, source, cancelCallback) {
  Vue.util.defineReactive(vm, key, {})
  var cb = source.on('value', function (snapshot) {
    vm[key] = snapshot.val()
  }, cancelCallback)
  vm._firebaseListeners[key] = { value: cb }
}

/**
 * Unbind a firebase-bound key from a vm.
 *
 * @param {Vue} vm
 * @param {string} key
 */
function unbind (vm, key) {
  var source = vm._firebaseSources[key]
  var listeners = vm._firebaseListeners[key]
  for (var event in listeners) {
    source.off(event, listeners[event])
  }
}

var VueFireMixin = {
  init: function () {
    var bindings = this.$options.firebase
    if (!bindings) return
    this.$firebaseRefs = Object.create(null)
    this._firebaseSources = Object.create(null)
    this._firebaseListeners = Object.create(null)
    for (var key in bindings) {
      bind(this, key, bindings[key])
    }
  },
  beforeDestroy: function () {
    for (var key in this.$firebaseRefs) {
      unbind(this, key)
    }
    this.$firebaseRefs = null
    this._firebaseSources = null
    this._firebaseListeners = null
  }
}

/**
 * Install function passed to Vue.use() in manual installation.
 *
 * @param {function} _Vue
 */
function install (_Vue) {
  Vue = _Vue
  Vue.mixin(VueFireMixin)
  // use object-based merge strategy
  var mergeStrats = Vue.config.optionMergeStrategies
  mergeStrats.firebase = mergeStrats.methods
  // extend instance methods
  Vue.prototype.$bind = function (key, source) {
    bind(this, key, source)
  }
  Vue.prototype.$unbind = function (key) {
    unbind(this, key)
  }
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

module.exports = install
