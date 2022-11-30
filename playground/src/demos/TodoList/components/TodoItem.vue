<script lang="ts" setup>
import type { Todo } from '../types'
import { computed, nextTick, ref } from 'vue'

const props = defineProps<{
  todo: Todo & { id: string }
}>()

const emit = defineEmits<{
  (event: 'update:todo', id: string, newTodo: Todo): void
  (event: 'remove', id: string): void
}>()

const isEditing = ref(false)
const textCopy = ref('')

function startEdit() {
  textCopy.value = props.todo.text
  isEditing.value = true
}

function saveTodo() {
  if (!isEditing.value) return

  emit('update:todo', props.todo.id, {
    ...props.todo,
    text: textCopy.value,
  })

  isEditing.value = false
}

const finished = computed({
  get: () => props.todo.finished,
  set(finished) {
    emit('update:todo', props.todo.id, { ...props.todo, finished })
  },
})

async function lostFocus() {
  await nextTick()
  saveTodo()
}
</script>

<template>
  <li>
    <form v-if="isEditing" @submit.prevent="saveTodo">
      <input
        v-model="textCopy"
        v-focus
        type="text"
        @keydown.esc="isEditing = false"
        @blur="lostFocus"
      />
      <button>Save</button>
      <button type="button" @click="isEditing = false">Cancel</button>
    </form>
    <template v-else>
      <input v-model="finished" type="checkbox" />
      <span
        :class="todo.finished ? 'line-through' : ''"
        @dblclick="startEdit"
        >{{ todo.text }}</span
      >
    </template>
    <button @click="$emit('delete', todo.id)">Delete</button>
  </li>
</template>
