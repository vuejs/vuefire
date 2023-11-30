import { mount } from '@vue/test-utils'
import { it, describe, expect } from 'vitest'
import { uploadString } from 'firebase/storage'
import { defineComponent, nextTick, ref } from 'vue'
import {
  useFirebaseStorage,
  useStorageFileMetadata,
  useStorageFile,
  useStorageFileUrl,
} from '../../src'
import { setupStorageRefs } from '../utils'

// FIXME: receiving empty errors from the firebase emulators when doing `uploadString()`
describe.skip('Storage', () => {
  const { storageRef } = setupStorageRefs()

  it('generates a URL', async () => {
    const objectRef = storageRef('my-text')
    await uploadString(objectRef, 'test', 'raw')
    const wrapper = mount(
      defineComponent({
        template: 'no',
        setup() {
          const { url, promise } = useStorageFileUrl(objectRef)

          return { url, promise }
        },
      })
    )

    await wrapper.vm.promise

    expect(wrapper.vm.url).toBeTypeOf('string')
    expect(wrapper.vm.url).toMatch(/my-url\.jpg/)
  })

  it('generates the metadata', async () => {
    const objectRef = storageRef('my-url.jpg')
    await uploadString(objectRef, 'test', 'raw')
    const wrapper = mount(
      defineComponent({
        template: 'no',
        setup() {
          const { metadata, promise } = useStorageFileMetadata(objectRef)

          return { metadata, promise }
        },
      })
    )

    await wrapper.vm.promise

    expect(wrapper.vm.metadata).toBeTypeOf('object')
    expect(wrapper.vm.metadata).toMatchObject({
      name: 'my-url.jpg',
    })
  })

  it('can create upload tasks', async () => {
    const objectRef = storageRef('my-url.jpg')
    await uploadString(objectRef, 'test', 'raw')
    const wrapper = mount(
      defineComponent({
        template: 'no',
        setup() {
          const { uploadTask, upload, uploadProgress } =
            useStorageFile(objectRef)

          return { uploadTask, upload, uploadProgress }
        },
      })
    )

    await nextTick()

    expect(wrapper.vm.uploadTask).toBeFalsy()
    expect(wrapper.vm.uploadProgress).toBe(null)

    // add a task
    const p = wrapper.vm.upload(new Uint8Array([0x48, 0x65]))
    expect(wrapper.vm.uploadTask).toBeTruthy()
    expect(wrapper.vm.uploadProgress).toBeTypeOf('number')

    await p
    expect(wrapper.vm.uploadTask).toBeFalsy()
    expect(wrapper.vm.uploadProgress).toBe(1) // 100%
  })
})
