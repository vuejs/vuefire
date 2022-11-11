<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useFileDialog } from '@vueuse/core'
import { useStorage, useStorageTask } from 'vuefire'
import { ref as storageRef, type StorageReference } from 'firebase/storage'

const filename = ref<string>()
const { files, open, reset } = useFileDialog()
// automatically set the filename when a file is selected
watch(
  () => files.value?.item(0)?.name,
  (name) => {
    // avoid clearing out the filename
    if (name && !filename.value) {
      filename.value = name
    }
  }
)

const storage = useStorage()

const storageBucket = storageRef(storage, 'demo')
const storageSource = ref<StorageReference>()
// automatically compute the data

const { progress, url, error, snapshot, uploadTask, data } =
  useStorageTask(storageSource)

// TODO: move to tests
// useStorageTask(storageSource, null).data
// // should fail
// useStorageTask(storageSource, new Blob()).data

function uploadPicture() {
  storageSource.value = storageRef(storageBucket, filename.value)
  data.value = files.value?.item(0)
}
</script>

<template>
  <form @submit.prevent="uploadPicture">
    <fieldset :disabled="!!uploadTask">
      <button
        type="button"
        @click="open({ accept: 'image/*', multiple: false })"
      >
        <template v-if="files?.length">
          <template v-if="files.length === 1"
            >Selected file: {{ files.item(0)!.name }} (Click to select
            another)</template
          >
          <template v-else>{{ files.length }} files (you hacker 😢)</template>
        </template>
        <template v-else> Select one picture </template>
      </button>

      <br />

      <label>
        Filename to use (leave blank to auto generate)
        <input type="text" v-model="filename" />
      </label>

      <br />

      <button>Upload</button>
    </fieldset>
  </form>

  <div v-if="error">
    <p>
      Error: {{ error.name }} ({{ error.code }})
      <br />
      {{ error.message }}
      <br />
    </p>
    <pre v-if="error.stack">{{ error.stack }}</pre>
    <pre v-if="error.customData">{{ error.customData }}</pre>
  </div>
  <div v-else-if="progress != null">
    <progress max="1" :value="progress">{{ progress * 100 }}%</progress>
  </div>
  <p v-if="url">
    Success: {{ url }}
    <br />
    <img :src="url" />
  </p>
  <p v-if="snapshot">File: {{ snapshot.ref.name }}</p>

  <p v-if="storageSource">Select a new file to simply update it</p>
  <p v-else>Clear the input to delete the file.</p>
  <button @click="data = null" :disabled="!data || !storageSource">
    Delete the picture
  </button>
</template>
