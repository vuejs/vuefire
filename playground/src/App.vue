<script setup lang="ts">
import { addDoc, collection, doc, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { ref } from 'vue'
import { firestoreBind } from 'vuefire';
import { useFirestore } from './firestore';

interface Todo {
  created: Date
  finished: boolean
  text: string
}

const db = useFirestore();
const todosCollection = collection(db, 'todos')
const finishedTodos = query(todosCollection, where('finished', '==', true))
const unfinishedTodos = query(todosCollection, where('finished', '==', false))

const todos = ref<Todo[]>([]);
// TODO: return an augmented typed ref
firestoreBind(todos, todosCollection);

const newTodoText = ref('')

function addTodo() {
  if (newTodoText.value) {
    addDoc(todosCollection, {
      text: newTodoText.value,
      finished: false,
      created: serverTimestamp()
    })
    newTodoText.value = ''
  }
}

function updateTodoText(todo: any, newText: string) {
  console.log('update', todo)
  return
  updateDoc(doc(db, 'todos', todo.id), {
    text: newText
  })

}

function removeTodo() { }

function toggleTodos() {
  // TODO:
}
</script>

<template>
  <button @click="toggleTodos">Toggle todos</button> <br />
  <input v-model.trim="newTodoText" @keyup.enter="addTodo" placeholder="Add new todo" />
  <ul>
    <li v-for="todo in todos">
      <input :value="todo.text" @input="updateTodoText(todo, $event.target.value)" />
      <button @click="removeTodo(todo)">X</button>
    </li>
  </ul>
</template>
