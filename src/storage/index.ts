import {
  getStorage,
  StorageReference,
  updateMetadata,
  uploadBytesResumable,
  uploadString,
  uploadBytes,
  deleteObject,
  getDownloadURL,
  getMetadata,
  getBlob,
  getBytes,
  list,
  listAll,
  UploadMetadata,
  UploadTask,
  UploadTaskSnapshot,
  StorageError,
} from 'firebase/storage'
import {
  computed,
  ComputedRef,
  getCurrentScope,
  isRef,
  onScopeDispose,
  Ref,
  ref,
  ShallowRef,
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

const START_UPLOAD_EMPTY_VALUES = [null, null, null] as [null, null, null]

/**
 * Result of `
 */
export interface UseUploadTask {
  /**
   * The current `UploadTask`. Falsy if no upload task is in progress.
   */
  uploadTask: ShallowRef<_Nullable<UploadTask>>

  /**
   * The current `UploadTaskSnapshot` for the current task. Falsy if there is no current task.
   */
  snapshot: ShallowRef<_Nullable<UploadTaskSnapshot>>

  /**
   * Error, if any, of the current task.
   */
  error: ShallowRef<_Nullable<StorageError>>

  /**
   * The progress of the current or last upload task. `null` if there isn't one.
   */
  progress: ComputedRef<number | null>

  /**
   * The download URL of the current or last upload task. `null` while the task is in progress.
   */
  url: Ref<_Nullable<string>>
}

export interface UseUploadTaskNoData extends UseUploadTask {
  /**
   * Data to upload. When changed to a different value, a new upload will take place. If set to `null`, it will delete
   * the storage object.
   */
  data: ShallowRef<_Nullable<Blob | Uint8Array | ArrayBuffer>>
}

/**
 * Creates an upload task for Firebase Storage. It automatically cancels, restarts, and updates the progress of the
 * task.
 *
 * @param storageRef - the storage reference
 * @param data - the data to upload
 * @param metadata - the metadata to upload
 */
export function useStorageTask(
  storageRef: _MaybeRef<_Nullable<StorageReference>>,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: _MaybeRef<UploadMetadata>
): UseUploadTask
export function useStorageTask(
  storageRef: _MaybeRef<_Nullable<StorageReference>>,
  data: Ref<_Nullable<Blob | Uint8Array | ArrayBuffer>>,
  metadata?: _MaybeRef<UploadMetadata>
): UseUploadTask
export function useStorageTask(
  storageRef: _MaybeRef<_Nullable<StorageReference>>,
  // allow passing null or undefined to still pass the metadata
  // this version creates a local data ref to let the user control when to update/delete the data
  data?: null | undefined,
  metadata?: _MaybeRef<UploadMetadata>
): UseUploadTaskNoData
export function useStorageTask(
  storageRef: _MaybeRef<_Nullable<StorageReference>>,
  data: _MaybeRef<_Nullable<Blob | Uint8Array | ArrayBuffer>>,
  metadata?: _MaybeRef<UploadMetadata>
): UseUploadTask
export function useStorageTask(
  storageRef: _MaybeRef<_Nullable<StorageReference>>,
  data: _MaybeRef<_Nullable<Blob | Uint8Array | ArrayBuffer>> = shallowRef<
    Blob | Uint8Array | ArrayBuffer | null
  >(),
  metadata: _MaybeRef<UploadMetadata> = {}
) {
  const uploadTask = shallowRef<UploadTask | null>()
  const snapshot = shallowRef<UploadTaskSnapshot | null>()
  const error = shallowRef<StorageError | null>()
  const url = ref<string | null>()

  const progress = computed(() => {
    const snap = unref(snapshot)
    return snap ? snap.bytesTransferred / snap.totalBytes : null
  })

  let unsub = noop
  function startUpload(
    // these are the current values we just don't need them since we call `startUpload()` in 2 different ways, it's
    // easier to get the values from the refs manually
    _: any = [],
    [previousStorageSource, previousData, previousMetadata]: [
      _Nullable<StorageReference>,
      // TODO: handle null value to delete
      _Nullable<Blob | Uint8Array | ArrayBuffer>,
      _Nullable<UploadMetadata>
    ] = START_UPLOAD_EMPTY_VALUES
  ) {
    const storageSource = unref(storageRef)
    const newData = unref(data)
    const newMetadata = unref(metadata)
    const currentTask = unref(uploadTask)

    // cancel previous task
    if (currentTask) {
      currentTask.cancel()
    }

    error.value = null
    snapshot.value = null
    uploadTask.value = null
    url.value = null
    unsub()

    if (storageSource && (newData || previousData)) {
      // we only need to update the metadata
      if (previousData === newData && previousStorageSource === storageSource) {
        updateMetadata(storageSource, newMetadata)
        // TODO: we probably need to update the metadata here
      } else if (!newData) {
        // if there was previously some data and this is the same storage ref, we need to delete the data
        if (previousData) {
          deleteObject(storageSource)
        } else {
          // otherwise, we need to get the data
          getDownloadURL(storageSource).then((downloadUrl) => {
            url.value = downloadUrl
          })
          // TODO: get metadata and create a metadata ref
        }
      } else {
        const newTask = uploadBytesResumable(
          storageSource,
          newData,
          newMetadata
        )
        uploadTask.value = newTask
        snapshot.value = newTask.snapshot

        unsub = newTask.on('state_changed', (newSnapshot) => {
          snapshot.value = newSnapshot
        })

        newTask.then(() => {
          uploadTask.value = null
          unsub()
          // set the url after the task is complete
          getDownloadURL(newTask.snapshot.ref).then((downloadUrl) => {
            url.value = downloadUrl
          })
        })

        newTask.catch((err) => {
          unsub()
          uploadTask.value = null
          error.value = err
        })
      }
    }
  }

  if (isRef(storageRef) || isRef(data) || isRef(metadata)) {
    watch(
      () => [unref(storageRef), unref(data), unref(metadata)] as const,
      // @ts-expect-error: vue type bug?
      startUpload,
      { immediate: true }
    )
  } else {
    // it's fine on server since the storageRef or the data should be null
    startUpload()
  }

  // remove the task subscription
  if (getCurrentScope()) {
    onScopeDispose(unsub)
  }

  return {
    uploadTask,
    snapshot,

    error,
    progress,

    url,
    data,
    // TODO: expose metadata directly so it doesn't have to be an update
    // metadata,

    // TODO: expose a method refresh to refresh url and metadata
    // refresh,
  }
}
