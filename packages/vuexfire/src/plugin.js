const VUEXFIRE_OBJECT_VALUE = 'VUEXFIRE_OBJECT_VALUE'
const VUEXFIRE_ARRAY_CHANGE = 'VUEXFIRE_ARRAY_CHANGE'
const VUEXFIRE_ARRAY_ADD = 'VUEXFIRE_ARRAY_ADD'
const VUEXFIRE_ARRAY_REMOVE = 'VUEXFIRE_ARRAY_REMOVE'
const VUEXFIRE_ARRAY_MOVE = 'VUEXFIRE_ARRAY_MOVE'

// exports.VUEXFIRE_ARRAY_MOVE = VUEXFIRE_ARRAY_MOVE
// exports.VUEXFIRE_ARRAY_REMOVE = VUEXFIRE_ARRAY_REMOVE
// exports.VUEXFIRE_ARRAY_ADD = VUEXFIRE_ARRAY_ADD
// exports.VUEXFIRE_ARRAY_CHANGE = VUEXFIRE_ARRAY_CHANGE
// exports.VUEXFIRE_OBJECT_VALUE = VUEXFIRE_OBJECT_VALUE

/**
 * Returns the key of a Firebase snapshot across SDK versions.
 *
 * @param {FirebaseSnapshot} snapshot
 * @return {string|null}
 */
function _getKey (snapshot) {
  return typeof snapshot.key === 'function'
    ? snapshot.key()
    : snapshot.key
}

/**
 * Returns the original reference of a Firebase reference or query across SDK versions.
 *
 * @param {FirebaseReference|FirebaseQuery} refOrQuery
 * @return {FirebaseReference}
 */
function _getRef (refOrQuery) {
  if (typeof refOrQuery.ref === 'function') {
    refOrQuery = refOrQuery.ref()
  } else if (typeof refOrQuery.ref === 'object') {
    refOrQuery = refOrQuery.ref
  }

  return refOrQuery
}

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
  var res = isObject(value)
    ? value
    : { '.value': value }
  res['.key'] = _getKey(snapshot)
  return res
}

function createVal (snapshot) {
  var value = snapshot.val()
  value['.key'] = _getKey(snapshot)
  return value
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
  /* istanbul ignore next */
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
  var asObject = false
  var cancelCallback = null
  // check { source, asArray, cancelCallback } syntax
  if (isObject(source) && source.hasOwnProperty('source')) {
    asObject = source.asObject
    cancelCallback = source.cancelCallback
    source = source.source
  }
  if (!isObject(source)) {
    throw new Error('VuexFire: invalid Firebase binding source.')
  }
  if (!(key in vm.$store.state)) {
    throw new Error(
      'VuexFire: bind failed: "' + key + '" is not defined in the store state'
    )
  }
  var ref = _getRef(source)
  vm.$firebaseRefs[key] = ref
  vm._firebaseSources[key] = source
  // bind based on initial value type
  if (asObject) {
    bindAsObject(vm, key, source, cancelCallback)
  } else {
    bindAsArray(vm, key, source, cancelCallback)
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
  // set it as an array
  vm.$store.state[key] = []

  const onAdd = source.on('child_added', function (snapshot, prevKey) {
    const array = vm.$store.state[key]
    const index = prevKey ? indexForKey(array, prevKey) + 1 : 0
    vm.$store.dispatch(VUEXFIRE_ARRAY_ADD, key, index, createVal(snapshot))
  }, cancelCallback)

  const onRemove = source.on('child_removed', function (snapshot) {
    const array = vm.$store.state[key]
    const index = indexForKey(array, _getKey(snapshot))
    vm.$store.dispatch(VUEXFIRE_ARRAY_REMOVE, key, index)
  }, cancelCallback)

  const onChange = source.on('child_changed', function (snapshot) {
    const array = vm.$store.state[key]
    const index = indexForKey(array, _getKey(snapshot))
    vm.$store.dispatch(VUEXFIRE_ARRAY_CHANGE, key, index, createRecord(snapshot))
  }, cancelCallback)

  const onMove = source.on('child_moved', function (snapshot, prevKey) {
    const array = vm.$store.state[key]
    const index = indexForKey(array, _getKey(snapshot))
    console.log('moved')
    var newIndex = prevKey ? indexForKey(array, prevKey) + 1 : 0
    // TODO refactor + 1
    newIndex += index < newIndex ? -1 : 0
    vm.$store.dispatch(VUEXFIRE_ARRAY_MOVE, key, index, newIndex, createRecord(snapshot))
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
  const cb = source.on('value', function (snapshot) {
    vm.$store.dispatch(VUEXFIRE_OBJECT_VALUE, key, createRecord(snapshot))
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
  var source = vm._firebaseSources && vm._firebaseSources[key]
  if (!source) {
    throw new Error(
      'VuexFire: unbind failed: "' + key + '" is not bound to ' +
        'a Firebase reference.'
    )
  }
  const listeners = vm._firebaseListeners[key]
  for (var event in listeners) {
    source.off(event, listeners[event])
  }
  vm.$firebaseRefs[key] = null
  vm._firebaseSources[key] = null
  vm._firebaseListeners[key] = null
}

function setupMutations (store) {
  store._mutations[VUEXFIRE_OBJECT_VALUE] = function (state, key, record) {
    state[key] = record
  }

  store._mutations[VUEXFIRE_ARRAY_CHANGE] = function (state, key, index, record) {
    state[key].splice(index, 1, record)
  }

  store._mutations[VUEXFIRE_ARRAY_ADD] = function (state, key, index, record) {
    state[key].splice(index, 0, record)
  }

  store._mutations[VUEXFIRE_ARRAY_REMOVE] = function (state, key, index) {
    state[key].splice(index, 1)
  }

  store._mutations[VUEXFIRE_ARRAY_MOVE] = function (state, key, index, newIndex) {
    const array = state[key]
    array.splice(newIndex, 0, array.splice(index, 1)[0])
  }
}

/**
 * Ensure the related bookkeeping variables on an instance.
 *
 * @param {Vue} vm
 */
function ensureRefs (vm) {
  if (!vm.$firebaseRefs) {
    vm.$firebaseRefs = Object.create(null)
    vm._firebaseSources = Object.create(null)
    vm._firebaseListeners = Object.create(null)
    setupMutations(vm.$store)
  }
}

const VuexFireMixin = {
  beforeDestroy: function () {
    if (!this.$firebaseRefs) return
    for (var key in this.$firebaseRefs) {
      if (this.$firebaseRefs[key]) {
        this.$unbind(key)
      }
    }
    this.$firebaseRefs = null
    this._firebaseSources = null
    this._firebaseListeners = null
  }
}

const VuexFireInit = function () {
  const bindings = this.$options.firebase
  if (!bindings) return
  ensureRefs(this)
  // TODO check for bindings in store
  for (var key in bindings) {
    bind(this, key, bindings[key])
  }
}

function install (Vue) {
  // override init to get called after vuex
  const version = Number(Vue.version.split('.')[0])

  if (version >= 2) {
    const usesInit = Vue.config._lifecycleHooks.indexOf('init') > -1
    Vue.mixin(usesInit ? { init: VuexFireInit } : { beforeCreate: VuexFireInit })
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    const _init = Vue.prototype._init
    Vue.prototype._init = function (options) {
      options = options || {}
      options.init = options.init
        ? [VuexFireInit].concat(options.init)
        : VuexFireInit
      _init.call(this, options)
    }
  }
  Vue.mixin(VuexFireMixin)

  // use object-based merge strategy
  const mergeStrats = Vue.config.optionMergeStrategies
  mergeStrats.firebase = mergeStrats.methods

  // extend instance methods
  Vue.prototype.$bindAsObject = function (key, source, cancelCallback) {
    ensureRefs(this)
    bind(this, key, {source: source, asObject: true, cancelCallback: cancelCallback})
  }

  Vue.prototype.$bindAsArray = function (key, source, cancelCallback) {
    ensureRefs(this)
    bind(this, key, {source: source, cancelCallback: cancelCallback})
  }

  Vue.prototype.$unbind = function (key) {
    unbind(this, key)
  }
}

module.exports = install

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
