# Firebase Storage

[Firebase Storage](https://firebase.google.com/docs/storage/web/start) is a cloud storage service for Firebase. It allows you to store and serve user-generated content like images, audio, video, and other files. While most of the APIs can be used as you would normally do with Firebase, VueFire exposes a few composables to integrate better with Vue. These not only give you access to reactive variables, but also to some actions like `upload()` which updates a file while also keeping the reactive variable up to date.

## Installation

You don't need to install anything specific to use Firebase Storage with VueFire. Just import the different composables you need from `vuefire` and you're good to go.

You can access the Firebase Storage from within any component with the composable `useFirebaseStorage()`.

## Uploading Files

To upload and monitor the upload progress of a file, use the `useStorageFile()` composable. This will expose the URL and metadata of the file once it's uploaded. Here's a full example of a form upload:

```vue{5,18}
<script setup lang="ts">
// See https://vueuse.org/core/useFileDialog
import { useFileDialog } from '@vueuse/core'
import { ref as storageRef } from 'firebase/storage'
import { useFirebaseStorage, useStorageFile } from 'vuefire'

const storage = useFirebaseStorage()
const mountainFileRef = storageRef(storage, 'images/mountains.jpg')

const {
  url,
  // gives you a percentage between 0 and 1 of the upload progress
  uploadProgress,
  uploadError,
  // firebase upload task
  uploadTask,
  upload,
} = useStorageFile(mountainFileRef)

function uploadPicture() {
  const data = files.value?.item(0)
  if (data) {
    upload(data)
  }
}

const filename = ref<string>()
const { files, open, reset } = useFileDialog()
</script>

<template>
  <form @submit.prevent="uploadPicture">
    <!-- disable the form while uploading -->
    <fieldset :disabled="!!uploadTask">
      <button
        type="button"
        @click="open({ accept: 'image/*', multiple: false })"
      >
        <template v-if="files?.length === 1">
          Selected file: {{ files.item(0)!.name }} (Click to select another)
        </template>
        <template v-else> Select one picture </template>
      </button>

      <br />

      <button>Upload</button>
    </fieldset>
  </form>
</template>
```

Once the picture is uploaded, you can use the `url` reactive variable. For example, if it's an image, you can display it:

```vue-html
<img v-if="url" :src="url" />
```

## Downloading Files

To get the download URL for a file, use the `useStorageFileUrl()` composable. This is useful if you **only** need to display a file:

```vue{3,11}
<script setup lang="ts">
import { ref as storageRef } from 'firebase/storage'
import { useFirebaseStorage, useStorageFileUrl } from 'vuefire'

const storage = useFirebaseStorage()
const mountainFileRef = storageRef(storage, 'images/mountains.jpg')
const {
  url,
  // refresh the url if the file changes
  refresh,
} = useStorageFileUrl(mountainFileRef)
</script>
```

## File metadata

To **only** access the file metadata, use the `useStorageFileMetadata()` composable. You can use the `update()` function to keep the metadata and reactive variable up to date:

```vue{3,13}
<script setup lang="ts">
import { ref as storageRef } from 'firebase/storage'
import { useFirebaseStorage, useStorageFileMetadata } from 'vuefire'

const storage = useFirebaseStorage()
const mountainFileRef = storageRef(storage, 'images/mountains.jpg')
const {
  metadata,
  // manually refresh the metadata
  refresh,
  // update metadata
  update,
} = useStorageFileMetadata(mountainFileRef)
</script>
```

Note the metadata is accessible on the `useStorageFile()` composable as well.
