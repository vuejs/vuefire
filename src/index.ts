import { defineComponent, PropType, VNodeProps, h } from 'vue'

/**
 * Returns true.
 */
export function mylib() {
  return true
}

export interface ComponentProps {
  custom?: boolean
  data: { title: string; summary: string }
}

export const ComponentImpl = defineComponent({
  props: {
    custom: Boolean,
    data: {
      required: true,
      type: Object as PropType<ComponentProps['data']>,
    },
  },

  setup(props) {
    return () =>
      h(
        'p',
        `Custom: ${props.custom}. ${props.data.title} - ${props.data.summary}.`
      )
  },
})

// export the public type for h/tsx inference
// also to avoid inline import() in generated d.ts files
/**
 * Component of vue-lib.
 */
export const Component = (ComponentImpl as any) as {
  new (): {
    $props: VNodeProps & ComponentProps
  }
}
