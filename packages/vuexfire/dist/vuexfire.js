/*!
 * vuexfire v0.3.0
 * (c) 2017 Eduardo San Martin Morote
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.VuexFire = global.VuexFire || {})));
}(this, (function (exports) { 'use strict';

var VUEXFIRE_OBJECT_VALUE = 'vuexfire/OBJECT_VALUE';
var VUEXFIRE_ARRAY_INITIALIZE = 'VUEXFIRE_ARRAY_INITIALIZE';
var VUEXFIRE_ARRAY_ADD = 'vuexfire/ARRAY_ADD';
var VUEXFIRE_ARRAY_CHANGE = 'vuexfire/ARRAY_CHANGE';
var VUEXFIRE_ARRAY_MOVE = 'vuexfire/ARRAY_MOVE';
var VUEXFIRE_ARRAY_REMOVE = 'vuexfire/ARRAY_REMOVE';

/**
 * Returns the module name of a given key
 * getModuleFromKey('items') => ''
 * getModuleFromKey('cart.items') => 'cart'
 * getModuleFromKey('user.cart.items') => 'user/cart'
 *
 * @param {string} key
 * @return {string} module name
 */


// /**
//  * Returns the key of a module + key string
//  * getKey('items') => 'items'
//  * getKey('cart.items') => 'items'
//  * getKey('user.cart.items') => 'items'
//  *
//  * @param {string} key
//  * @return {string} key as defined in the state
//  */
// export function getKey (key) {
//   var keys = key.split('.')
//   return keys[keys.length - 1] || ''
// }

/**
 * Find the index for an object with given key.
 *
 * @param {array} array
 * @param {string} key
 * @return {number}
 */
function indexForKey (array, key) {
  for (var i = 0; i < array.length; i++) {
    if (array[i]['.key'] === key) { return i }
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
function isObject (val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

/**
 * Returns the key of a Firebase snapshot across SDK versions.
 *
 * @param {FirebaseSnapshot} snapshot
 * @return {string|null}
 */
function getKey (snapshot) {
  return typeof snapshot.key === 'function'
  /* istanbul ignore next: Firebase 2.x */
    ? snapshot.key()
    : snapshot.key
}

/**
 * Returns the original reference of a Firebase reference or query across SDK
 * versions.
 *
 * @param {FirebaseReference|FirebaseQuery} refOrQuery
 * @return {FirebaseReference}
 */
function getRef (refOrQuery) {
  /* istanbul ignore if: Firebase 2.x */
  if (typeof refOrQuery.ref === 'function') {
    refOrQuery = refOrQuery.ref();
    /* istanbul ignore else: Fallback */
  } else if (typeof refOrQuery.ref === 'object') {
    refOrQuery = refOrQuery.ref;
  }

  return refOrQuery
}

/**
 * Convert firebase snapshot into a bindable data record.
 *
 * @param {FirebaseSnapshot} snapshot
 * @return {Object}
 */
function createRecord (snapshot) {
  var value = snapshot.val();
  var res = isObject(value)
        ? value
        : { '.value': value };
  res['.key'] = getKey(snapshot);
  return res
}

var mutations = {};
mutations[VUEXFIRE_OBJECT_VALUE] = function (state, payload) {
    state[payload.key] = payload.record;
  };
mutations[VUEXFIRE_ARRAY_INITIALIZE] = function (state, payload) {
    state[payload.key] = [];
  };
mutations[VUEXFIRE_ARRAY_ADD] = function (state, payload) {
    state[payload.key].splice(payload.index, 0, payload.record);
  };
mutations[VUEXFIRE_ARRAY_CHANGE] = function (state, payload) {
    state[payload.key].splice(payload.index, 1, payload.record);
  };
mutations[VUEXFIRE_ARRAY_MOVE] = function (state, payload) {
    var array = state[payload.key];
    array.splice(payload.newIndex, 0, array.splice(payload.index, 1)[0]);
  };
mutations[VUEXFIRE_ARRAY_REMOVE] = function (state, payload) {
    state[payload.key].splice(payload.index, 1);
  };

function VuexFire (store) {
}

function bindAsObject (ref) {
  var key = ref.key;
  var source = ref.source;
  var cancelCallback = ref.cancelCallback;
  var listeners = ref.listeners;
  var commit = ref.commit;

  var cb = source.on('value', function (snapshot) {
    commit(VUEXFIRE_OBJECT_VALUE, {
      key: key,
      record: createRecord(snapshot)
    });
  }, cancelCallback);
  listeners[key] = { value: cb };
}

function bindAsArray (ref) {
  var key = ref.key;
  var source = ref.source;
  var cancelCallback = ref.cancelCallback;
  var listeners = ref.listeners;
  var commit = ref.commit;
  var state = ref.state;

  // Initialise the array to an empty one
  commit(VUEXFIRE_ARRAY_INITIALIZE, { key: key });
  var onAdd = source.on('child_added', function (snapshot, prevKey) {
    var array = state[key];
    var index = prevKey ? indexForKey(array, prevKey) + 1 : 0;
    commit(VUEXFIRE_ARRAY_ADD, {
      key: key,
      index: index,
      record: createRecord(snapshot)
    });
  }, cancelCallback);

  var onRemove = source.on('child_removed', function (snapshot) {
    var array = state[key];
    var index = indexForKey(array, getKey(snapshot));
    commit(VUEXFIRE_ARRAY_REMOVE, {
      key: key,
      index: index
    });
  }, cancelCallback);

  var onChange = source.on('child_changed', function (snapshot) {
    var array = state[key];
    var index = indexForKey(array, getKey(snapshot));
    commit(VUEXFIRE_ARRAY_CHANGE, {
      key: key,
      index: index,
      record: createRecord(snapshot)
    });
  }, cancelCallback);

  var onMove = source.on('child_moved', function (snapshot, prevKey) {
    var array = state[key];
    var index = indexForKey(array, getKey(snapshot));
    var newIndex = prevKey ? indexForKey(array, prevKey) + 1 : 0;
    // TODO refactor + 1
    newIndex += index < newIndex ? -1 : 0;
    commit(VUEXFIRE_ARRAY_MOVE, {
      key: key,
      index: index,
      newIndex: newIndex,
      record: createRecord(snapshot)
    });
  }, cancelCallback);

  listeners[key] = {
    child_added: onAdd,
    child_changed: onChange,
    child_removed: onRemove,
    child_moved: onMove
  };
}

function generateBind (ref) {
  var commit = ref.commit;
  var state = ref.state;
  var context = ref.context;

  var listeners = Object.create(null);
  var sources = Object.create(null);
  // Make it work for modules
  if (context && context.commit) { commit = context.commit; }

  function bind (key, source, cancelCallback) {
    // Unbind if it already exists
    if (key in sources) {
      unbind(key);
    }
    sources[key] = getRef(source);
    if (state[key] && 'length' in state[key]) {
      bindAsArray({ key: key, source: source, cancelCallback: cancelCallback, commit: commit, state: state, listeners: listeners });
    } else {
      bindAsObject({ key: key, source: source, cancelCallback: cancelCallback, commit: commit, listeners: listeners });
    }
  }

  function unbind (key) {
    var oldSource = sources[key];
    var oldListeners = listeners[key];
    for (var event in oldListeners) {
      oldSource.off(event, oldListeners[event]);
    }
  }

  return {
    bind: bind,
    unbind: unbind
  }
}

exports['default'] = VuexFire;
exports.generateBind = generateBind;
exports.mutations = mutations;

Object.defineProperty(exports, '__esModule', { value: true });

})));
