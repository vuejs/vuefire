/*!
 * vuexfire v2.3.0
 * (c) 2017 Eduardo San Martin Morote
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
  /* istanbul ignore else: Fallback */
  /* istanbul ignore next: Firebase 2.x */
  if (typeof refOrQuery.ref === 'function') {
    refOrQuery = refOrQuery.ref();
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

var VUEXFIRE_OBJECT_VALUE = 'vuexfire/OBJECT_VALUE';
var VUEXFIRE_ARRAY_INITIALIZE = 'VUEXFIRE_ARRAY_INITIALIZE';
var VUEXFIRE_ARRAY_ADD = 'vuexfire/ARRAY_ADD';
var VUEXFIRE_ARRAY_CHANGE = 'vuexfire/ARRAY_CHANGE';
var VUEXFIRE_ARRAY_MOVE = 'vuexfire/ARRAY_MOVE';
var VUEXFIRE_ARRAY_REMOVE = 'vuexfire/ARRAY_REMOVE';


var types = Object.freeze({
	VUEXFIRE_OBJECT_VALUE: VUEXFIRE_OBJECT_VALUE,
	VUEXFIRE_ARRAY_INITIALIZE: VUEXFIRE_ARRAY_INITIALIZE,
	VUEXFIRE_ARRAY_ADD: VUEXFIRE_ARRAY_ADD,
	VUEXFIRE_ARRAY_CHANGE: VUEXFIRE_ARRAY_CHANGE,
	VUEXFIRE_ARRAY_MOVE: VUEXFIRE_ARRAY_MOVE,
	VUEXFIRE_ARRAY_REMOVE: VUEXFIRE_ARRAY_REMOVE
});

var mutations = {};
mutations[VUEXFIRE_OBJECT_VALUE] = function (state, ref) {
    var key = ref.key;
    var record = ref.record;

    state[key] = record;
  };
mutations[VUEXFIRE_ARRAY_INITIALIZE] = function (state, ref) {
    var key = ref.key;
    var value = ref.value;

    state[key] = value;
  };
mutations[VUEXFIRE_ARRAY_ADD] = function (state, ref) {
    var key = ref.key;
    var index = ref.index;
    var record = ref.record;
    var array = ref.array;

    array = array || state[key];
    array.splice(index, 0, record);
  };
mutations[VUEXFIRE_ARRAY_CHANGE] = function (state, ref) {
    var key = ref.key;
    var index = ref.index;
    var record = ref.record;
    var array = ref.array;

    array = array || state[key];
    array.splice(index, 1, record);
  };
mutations[VUEXFIRE_ARRAY_MOVE] = function (state, ref) {
    var key = ref.key;
    var index = ref.index;
    var newIndex = ref.newIndex;
    var array = ref.array;

    array = array || state[key];
    array.splice(newIndex, 0, array.splice(index, 1)[0]);
  };
mutations[VUEXFIRE_ARRAY_REMOVE] = function (state, ref) {
    var key = ref.key;
    var index = ref.index;
    var array = ref.array;

    array = array || state[key];
    array.splice(index, 1);
  };

var firebaseMutations = {};

Object.keys(types).forEach(function (key) {
  // the { commit, state, type, ...payload } syntax is not supported by buble...
  var type = types[key];
  firebaseMutations[type] = function (_, context) {
    mutations[type](context.state, context);
  };
});

var commitOptions = { root: true };

function bindAsObject (ref) {
  var key = ref.key;
  var source = ref.source;
  var cancelCallback = ref.cancelCallback;
  var commit = ref.commit;
  var state = ref.state;

  var cb = source.on('value', function (snapshot) {
    commit(VUEXFIRE_OBJECT_VALUE, {
      type: VUEXFIRE_OBJECT_VALUE,
      key: key,
      record: createRecord(snapshot),
      state: state,
    }, commitOptions);
  }, cancelCallback);

  // return the listeners that have been setup
  return { value: cb }
}

function bindAsArray (ref) {
  var key = ref.key;
  var source = ref.source;
  var cancelCallback = ref.cancelCallback;
  var wait = ref.wait;
  var commit = ref.commit;
  var state = ref.state;

  // Initialise the array to an empty one
  var array = [];
  var initializeArray = function () {
    commit(VUEXFIRE_ARRAY_INITIALIZE, {
      type: VUEXFIRE_ARRAY_INITIALIZE,
      state: state,
      key: key,
      value: array,
    }, commitOptions);
  };

  if (!wait) {
    initializeArray();
  } else {
    source.once('value', initializeArray);
  }

  var onAdd = source.on('child_added', function (snapshot, prevKey) {
    var index = prevKey ? indexForKey(array, prevKey) + 1 : 0;
    commit(VUEXFIRE_ARRAY_ADD, {
      type: VUEXFIRE_ARRAY_ADD,
      state: state,
      key: key,
      index: index,
      array: wait && array,
      record: createRecord(snapshot),
    }, commitOptions);
  }, cancelCallback);

  var onRemove = source.on('child_removed', function (snapshot) {
    var index = indexForKey(array, getKey(snapshot));
    commit(VUEXFIRE_ARRAY_REMOVE, {
      type: VUEXFIRE_ARRAY_REMOVE,
      state: state,
      key: key,
      index: index,
      array: wait && array,
    }, commitOptions);
  }, cancelCallback);

  var onChange = source.on('child_changed', function (snapshot) {
    var index = indexForKey(array, getKey(snapshot));
    commit(VUEXFIRE_ARRAY_CHANGE, {
      type: VUEXFIRE_ARRAY_CHANGE,
      state: state,
      key: key,
      index: index,
      array: wait && array,
      record: createRecord(snapshot),
    }, commitOptions);
  }, cancelCallback);

  var onMove = source.on('child_moved', function (snapshot, prevKey) {
    var index = indexForKey(array, getKey(snapshot));
    var newIndex = prevKey ? indexForKey(array, prevKey) + 1 : 0;
    // TODO refactor + 1
    newIndex += index < newIndex ? -1 : 0;
    commit(VUEXFIRE_ARRAY_MOVE, {
      type: VUEXFIRE_ARRAY_MOVE,
      state: state,
      key: key,
      index: index,
      newIndex: newIndex,
      array: wait && array,
      record: createRecord(snapshot),
    }, commitOptions);
  }, cancelCallback);

  // return the listeners that have been setup
  return {
    child_added: onAdd,
    child_changed: onChange,
    child_removed: onRemove,
    child_moved: onMove,
  }
}

// Firebase binding
var bindings = new WeakMap();

function bind (ref) {
  var state = ref.state;
  var commit = ref.commit;
  var key = ref.key;
  var source = ref.source;
  var ref_options = ref.options;
  var cancelCallback = ref_options.cancelCallback;
  var readyCallback = ref_options.readyCallback;
  var errorCallback = ref_options.errorCallback;
  var wait = ref_options.wait; if ( wait === void 0 ) wait = true;

  if (!isObject(source)) {
    throw new Error('VuexFire: invalid Firebase binding source.')
  }
  if (!(key in state)) {
    throw new Error(("VuexFire: cannot bind undefined property '" + key + "'. Define it on the state first."))
  }
  // Unbind if it already exists
  var binding = bindings.get(commit);
  if (!binding) {
    binding = {
      sources: Object.create(null),
      listeners: Object.create(null),
    };
    bindings.set(commit, binding);
  }
  if (key in binding.sources) {
    unbind({ commit: commit, key: key });
  }
  binding.sources[key] = getRef(source);

  // Support for SSR
  // We have to listen for the readyCallback first so it
  // gets called after the initializeArray callback
  if (readyCallback || errorCallback) {
    source.once('value', readyCallback, errorCallback);
  }

  // Automatically detects if it should be bound as an array or as an object
  var listener;
  if (state[key] && 'length' in state[key]) {
    listener = bindAsArray({ key: key, source: source, cancelCallback: cancelCallback, wait: wait, commit: commit, state: state });
  } else {
    listener = bindAsObject({ key: key, source: source, cancelCallback: cancelCallback, commit: commit, state: state });
  }

  binding.listeners[key] = listener;
}

function unbind (ref) {
  var commit = ref.commit;
  var key = ref.key;

  var binding = bindings.get(commit);
  if (!binding) {
    binding = {
      sources: Object.create(null),
      listeners: Object.create(null),
    };
    bindings.set(commit, binding);
  }
  if (!(key in binding.sources)) {
    throw new Error(("VuexFire: cannot unbind '" + key + "' because it wasn't bound."))
  }
  var oldSource = binding.sources[key];
  var oldListeners = binding.listeners[key];
  for (var event in oldListeners) {
    oldSource.off(event, oldListeners[event]);
  }
  // clean up
  delete binding.sources[key];
  delete binding.listeners[key];
}

function firebaseAction (action) {
  return function firebaseEnhancedActionFn (context, payload) {
    // get the local state and commit. These may be bound to a module
    var state = context.state;
    var commit = context.commit;
    context.bindFirebaseRef = function (key, source, options) {
        if ( options === void 0 ) options = {};

        return bind({ state: state, commit: commit, key: key, source: source, options: options });
    };
    context.unbindFirebaseRef = function (key) { return unbind({ commit: commit, key: key }); };
    return action(context, payload)
  }
}

exports.firebaseMutations = firebaseMutations;
exports.firebaseAction = firebaseAction;
