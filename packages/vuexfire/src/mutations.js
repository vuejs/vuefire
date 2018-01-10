import {
  VUEXFIRE_SET_VALUE,
  VUEXFIRE_ARRAY_ADD,
  VUEXFIRE_ARRAY_REMOVE,
} from './types'

import { walkSet } from './utils'

export default {
  [VUEXFIRE_SET_VALUE] (state, { path, target, data }) {
    walkSet(target, path, data)
    // state[key] = record
  },

  [VUEXFIRE_ARRAY_ADD] (state, { newIndex, data, target }) {
    target.splice(newIndex, 0, data)
  },

  [VUEXFIRE_ARRAY_REMOVE] (state, { oldIndex, target }) {
    return target.splice(oldIndex, 1)[0]
  },
}
