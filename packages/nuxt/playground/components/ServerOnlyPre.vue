<script setup lang="ts">
type Props = {
  data: MaybeRef<unknown>,
  testid: string
}
const props = defineProps<Props>()

const serverState = useState();
if (import.meta.server) {
  serverState.value = JSON.parse(JSON.stringify(toValue(props.data)));
}
</script>

<template>
  <pre :data-testid="props.testid">{{ serverState }}</pre>
</template>
