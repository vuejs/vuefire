<script setup lang="ts">
import type { Todo } from '@/demos/TodoList/types'
import TodoItem from '@/demos/TodoList/components/TodoItem.vue'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { ref } from 'vue'
import { useCollection, useFirestore } from 'vuefire'

// TODO: expose some kind of type to make this posssible
// type TodoData = _VueFireQueryData<Todo>

const db = useFirestore()
const todosRef = collection(db, 'todos')
const todosWithConverterRef = collection(db, 'todos').withConverter<Todo>({
  toFirestore(todoModel) {
    const {
      // @ts-expect-error: it might not exist
      id,
      ...todo
    } = todoModel
    return todo
  },
  fromFirestore(snapshot, options) {
    const todoData = snapshot.data(options) as Omit<Todo, 'id'>
    return {
      id: snapshot.id,
      ...todoData,
    }
  },
})
const finishedTodos = query(todosRef, where('finished', '==', true))
const unfinishedTodos = query(todosRef, where('finished', '==', false))

const todos = useCollection<Todo>(todosRef)
const todosConverted = useCollection(todosWithConverterRef)

const newTodoText = ref('')

function addTodo() {
  if (newTodoText.value) {
    addDoc(todosRef, {
      text: newTodoText.value,
      finished: false,
      created: serverTimestamp(),
    })
    newTodoText.value = ''
  }
}

function updateTodo(id: string, newTodo: Todo) {
  // NOTE: the copy shouldn't be necessary...
  updateDoc(doc(todosRef, id), { ...newTodo })
}

function removeTodo(id: string) {
  deleteDoc(doc(db, 'todos', id))
}

function toggleTodos() {
  // TODO:
}
</script>

<template>
  <button @click="toggleTodos">Toggle todos</button> <br />
  <form @submit.prevent="addTodo">
    <input v-model.trim="newTodoText" placeholder="Add new todo" />
    <button>Add Todo</button>
  </form>
  <ul>
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      @remove="removeTodo"
      @update:todo="updateTodo"
    />
  </ul>
</template>
