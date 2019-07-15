import { MutationTree } from 'vuex'
import { VUEXFIRE_SET_VALUE, VUEXFIRE_ARRAY_ADD, VUEXFIRE_ARRAY_REMOVE } from './mutations-types'

import { walkSet } from '@posva/vuefire-core'

export const vuexfireMutations: MutationTree<any> = {
  [VUEXFIRE_SET_VALUE](state, { path, target, data }) {
    walkSet(target, path, data)
  },

  [VUEXFIRE_ARRAY_ADD](state, { newIndex, data, target }) {
    target.splice(newIndex, 0, data)
  },

  [VUEXFIRE_ARRAY_REMOVE](state, { oldIndex, target }) {
    return target.splice(oldIndex, 1)[0]
  },
}
