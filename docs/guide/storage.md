# Firebase Storage

[Firebase Storage](https://firebase.google.com/docs/storage/web/start) is a cloud storage service for Firebase. It allows you to store and serve user-generated content like images, audio, video, and other files. While most of the APIs can be used as you would normally do with Firebase, VueFire exposes a few composables to integrate better with Vue that not only give you access to reactive variables but also to some actions like `upload()` to update a file while keeping the reactive variable up to date at the same time.

## Installation

You don't need to install anything specific to use Firebase Storage with VueFire. Just import the different composables you need from `vuefire` and you're good to go.

You can access the Firebase Storage from within any component with the composable `useFirebaseStorage()`.

## Uploading Files

You can upload and monitor the progress of a file upload with the `useStorageFile()` composable. This also exposes the URL of the file once it's uploaded and its metadata, let's start with a full example of a form upload:

```vue
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

VueFire also exposes a smaller composable that only retrieves the url of a file. This is useful if you don't need to upload a file but only display it:

```vue
<script setup lang="ts">
import { useFileDialog } from '@vueuse/core'
import { ref as storageRef } from 'firebase/storage'
import { useFirebaseStorage, useStorageFile, useStorageFileUrl } from 'vuefire'

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

The same way you can access the file URL you can also access the file metadata. You can also use the `update()` function to update the metadata and keep the reactive variable up to date:

```vue
<script setup lang="ts">
import { useFileDialog } from '@vueuse/core'
import { ref as storageRef } from 'firebase/storage'
import { useFirebaseStorage, useStorageFile } from 'vuefire'

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
