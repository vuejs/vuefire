import {
  DefaultData,
  DefaultMethods,
  DefaultComputed,
  ThisTypedComponentOptionsWithArrayProps,
  DefaultProps,
  ThisTypedComponentOptionsWithRecordProps,
} from 'vue/types/options'

export * from './rtdb'
export * from './firestore'

declare module 'vue/types/vue' {
  interface VueConstructor<V extends Vue> {
    extend<
      Data = DefaultData<V>,
      Methods = DefaultMethods<V>,
      Computed = DefaultComputed,
      PropNames extends string = never
    >(
      options?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames>
    ): ExtendedVue<V, Data, Methods, Computed, Record<PropNames, any>>
    extend<
      Data = DefaultData<V>,
      Methods = DefaultMethods<V>,
      Computed = DefaultComputed,
      Props = DefaultProps
    >(
      options?: ThisTypedComponentOptionsWithRecordProps<V, Data, Methods, Computed, Props>
    ): ExtendedVue<V, Data, Methods, Computed, Props>
  }
}
