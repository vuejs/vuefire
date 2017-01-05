export function isKeyInState (state, module, key) {
  return (module
    ? walkObject(state, module.split('/'))[key]
    : state[key]) !== undefined
}

export function initWithValue (state, module, key, value) {
  if (module) {
    walkObject(state, module.split('/'))[key] = value
  } else {
    state[key] = value
  }
}

export function get (state, module, key) {
  return module
    ? walkObject(state, module.split('/'))[key]
    : state[key]
}

export function getMutationName (module, mutation) {
  return module
    ? module + '/' + mutation
    : mutation
}

function walkObject (obj, keys) {
  return keys.reduce(function (target, key) {
    return target[key]
  }, obj)
}
