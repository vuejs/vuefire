/**
 * Augment the typings of Vue.js
 */

import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $bind: any
    $unbind: any
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    firestore?: any
  }
}
