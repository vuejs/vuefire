import * as firebase from 'firebase'
import { PluginFunction } from 'vue'
import './vue'


interface Options {
  bindName?: string
  unbindName?: string
}

export declare const firestorePlugin: PluginFunction<Options>
export declare const rtdbPlugin: PluginFunction<Options>
