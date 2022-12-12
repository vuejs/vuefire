<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useFileDialog } from '@vueuse/core'
import { useCurrentUser, useFirebaseStorage, useStorageFile } from 'vuefire'
import {
  deleteObject,
  ref as storageRef,
  type StorageReference,
} from 'firebase/storage'

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

const user = useCurrentUser()

const storage = useFirebaseStorage()
const storageBucket = storageRef(storage, 'demo/' + user.value?.uid || '')
const storageSource = computed(() =>
  filename.value ? storageRef(storageBucket, filename.value) : null
)

const {
  uploadProgress: progress,
  url,
  uploadError: error,
  snapshot,
  uploadTask,
  metadata,
  upload,
} = useStorageFile(storageSource)

// TODO: move to tests
// useStorageTask(storageSource, null).data
// // should fail
// useStorageTask(storageSource, new Blob()).data

function uploadPicture() {
  const data = files.value?.item(0)
  if (data) {
    upload(data)
  }
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
  <pre>{{ metadata }}</pre>

  <p v-if="storageSource">Select a new file to simply update it</p>
  <p v-else>Clear the input to delete the file.</p>
  <button @click="deleteObject(storageSource!)" :disabled="!storageSource">
    Delete the picture
  </button>
</template>
