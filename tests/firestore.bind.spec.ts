import { ComponentPublicInstance, markRaw, ref } from 'vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { firestorePlugin } from '../src/vuefire/firestore'
import {
  CollectionReference,
  connectFirestoreEmulator,
  doc,
  DocumentReference,
  getFirestore,
  updateDoc,
  collection,
  deleteDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { firestoreBind } from '../src'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('Firestore bind', () => {
  const firebaseApp = initializeApp({ projectId: 'vue-fire-store' })
  const firestore = getFirestore(firebaseApp)
  connectFirestoreEmulator(firestore, 'localhost', 8080)
  const testsCollection = collection(firestore, `__tests`)
  const itemRef = doc(testsCollection, 'item')

  afterAll(async () => {
    // clean up the tests data
    const { docs } = await getDocs(testsCollection)
    await Promise.all(docs.map(doc => deleteDoc(doc.ref)))
  })

  it('works', async () => {
    const wrapper = mount(
      {
        template: 'no',
        setup() {
          const item = ref<unknown>()
          const promise = markRaw(firestoreBind(item, itemRef))

          return { item, promise }
        },
      },
      { global: { plugins: [firestorePlugin] } }
    )

    expect(wrapper.vm.item).toBeUndefined()
    await wrapper.vm.promise
    expect(wrapper.vm.item).toBeNull()

    await setDoc(itemRef, { text: 'world' })
    expect(wrapper.vm.item).toMatchObject({ text: 'world' })
  })
})
