import {
  getStorage,
  StorageReference,
  updateMetadata,
  uploadBytesResumable,
  deleteObject,
  getDownloadURL,
  getMetadata,
  UploadMetadata,
  UploadTask,
  UploadTaskSnapshot,
  StorageError,
  SettableMetadata,
} from 'firebase/storage'
import {
  computed,
  getCurrentInstance,
  getCurrentScope,
  isRef,
  onScopeDispose,
  onServerPrefetch,
  ref,
  shallowRef,
  unref,
  watch,
} from 'vue'
import { useFirebaseApp } from '../app'
import { noop, _MaybeRef, _Nullable } from '../shared'

/**
 * Retrieves the Storage instance.
 *
 * @param name - name of the application
 * @returns the Database instance
 */
export function useStorage(name?: string) {
  return getStorage(useFirebaseApp(name))
}

/**
 * Retrieves a reactive download URL of a `StorageReference`. Updates automatically if the `StorageReference` changes.
 *
 * @param storageRef - StorageReference
 */
export function useStorageUrl(
  storageRef: _MaybeRef<_Nullable<StorageReference>>
) {
  const url = ref<string | null>()
  const promise = ref<Promise<string | null>>(Promise.resolve(null))

  function refresh() {
    const storageSource = unref(storageRef)
    if (storageSource) {
      promise.value = getDownloadURL(storageSource).then(
        (downloadUrl) => (url.value = downloadUrl)
      )
    } else {
      promise.value = Promise.resolve((url.value = null))
    }
    return promise.value
  }

  refresh()
  if (isRef(storageRef)) {
    watch(storageRef, refresh)
  }

  if (getCurrentInstance()) {
    // TODO: rework API to allow adding with a custom group key and key
    // addPendingPromise(promise)
    onServerPrefetch(() => promise.value)
  }

  return { url, refresh, promise }
}

/**
 * Returns a reactive version of the metadata of a `StorageReference`. Updates automatically if the `StorageReference`
 * changes.
 *
 * @param storageRef - StorageReference
 */
export function useStorageMetadata(
  storageRef: _MaybeRef<_Nullable<StorageReference>>
) {
  // TODO: retrieve global data from  local store
  const metadata = shallowRef<UploadMetadata | null>()
  const promise = shallowRef<Promise<UploadMetadata | null>>(
    Promise.resolve(null)
  )

  function refresh() {
    const storageSource = unref(storageRef)
    if (storageSource) {
      promise.value = getMetadata(storageSource).then(
        (data) => (metadata.value = data)
      )
    } else {
      promise.value = Promise.resolve((metadata.value = null))
    }
    return promise.value
  }

  function update(newMetadata: SettableMetadata) {
    const storageSource = unref(storageRef)
    if (storageSource) {
      promise.value = updateMetadata(storageSource, newMetadata).then(
        (newData) => {
          return (metadata.value = newData)
        }
      )
    } else {
      // TODO: DEV warning
    }
    return promise.value
  }

  refresh()
  if (isRef(storageRef)) {
    watch(storageRef, refresh)
  }

  if (getCurrentInstance()) {
    // TODO: rework API to allow adding with a custom group key and key
    // addPendingPromise(promise)
    onServerPrefetch(() => promise.value)
  }

  return { metadata, update, refresh, promise }
}

/**
 * Reactive information (url, metadata) of a `StorageReference`. Allows updating and deleting the storage object.
 *
 * @param storageRef - StorageReference
 */
export function useStorageObject(
  storageRef: _MaybeRef<_Nullable<StorageReference>>
) {
  const { url, refresh: refreshUrl } = useStorageUrl(storageRef)
  const {
    metadata,
    update: updateMetadata,
    refresh: refreshMetadata,
  } = useStorageMetadata(storageRef)

  const uploadTask = shallowRef<UploadTask | null>()
  const snapshot = shallowRef<UploadTaskSnapshot | null>()
  const uploadError = shallowRef<StorageError | null>()

  const uploadProgress = computed(() => {
    const snap = unref(snapshot)
    return snap ? snap.bytesTransferred / snap.totalBytes : null
  })

  // unsubscribe from the task
  let unsub = noop

  function upload(
    newData: Blob | Uint8Array | ArrayBuffer,
    newMetadata?: UploadMetadata
  ) {
    const storageSource = unref(storageRef)
    const currentTask = unref(uploadTask)

    // cancel previous task
    if (currentTask) {
      currentTask.cancel()
    }

    uploadError.value = null
    snapshot.value = null
    uploadTask.value = null
    url.value = null
    metadata.value = null
    unsub()

    if (storageSource) {
      const newTask = uploadBytesResumable(storageSource, newData, newMetadata)
      uploadTask.value = newTask
      snapshot.value = newTask.snapshot

      unsub = newTask.on('state_changed', (newSnapshot) => {
        snapshot.value = newSnapshot
      })

      newTask.then((finalSnapshot) => {
        uploadTask.value = null
        unsub()
        metadata.value = finalSnapshot.metadata
        // get the new download URL
        refreshUrl()
      })

      newTask.catch((err) => {
        unsub()
        uploadTask.value = null
        uploadError.value = err
      })
    }
  }

  function _deleteObject() {
    const storageSource = unref(storageRef)
    if (storageSource) {
      deleteObject(storageSource)
      metadata.value = null
      url.value = null
      unsub()
      snapshot.value = null
      uploadTask.value = null
    }
  }

  function refresh() {
    return Promise.all([refreshUrl(), refreshMetadata()])
  }

  if (isRef(storageRef)) {
    watch(storageRef, (storageSource) => {
      if (!storageSource) {
        if (uploadTask.value) {
          unsub()
          uploadTask.value.cancel()
        }
        uploadTask.value = null
        snapshot.value = null
      }
      refresh()
    })
  }

  // remove the task subscription
  if (getCurrentScope()) {
    onScopeDispose(unsub)
  }

  return {
    url,
    metadata,
    snapshot,

    uploadTask,
    uploadError,
    uploadProgress,
    upload,
    updateMetadata,

    refresh,
    // promise,
  }
}
