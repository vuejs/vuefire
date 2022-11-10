/**
 * @vitest-environment node
 */
import { mount } from '@vue/test-utils'
import { beforeEach, describe, it, expect, afterEach } from 'vitest'
import {
  CollectionReference,
  doc as originalDoc,
  DocumentData,
  DocumentReference,
} from 'firebase/firestore'
import { setupFirestoreRefs, sleep, firebaseApp } from '../utils'
import { onServerPrefetch, ShallowUnwrapRef, unref } from 'vue'
import { _InferReferenceType, _RefFirestore } from '../../src/firestore'
import {
  UseDocumentOptions,
  UseCollectionOptions,
  usePendingPromises,
  VueFirestoreQueryData,
  useDocument,
  useCollection,
} from '../../src'
import { _MaybeRef, _Nullable } from '../../src/shared'
import { Component, createSSRApp, inject, ref, computed, customRef } from 'vue'
import { renderToString, ssrInterpolate } from '@vue/server-renderer'
import { clearPendingPromises, getInitialData } from '../../src/ssr/plugin'

describe('Firestore refs in documents', async () => {
  const { collection, query, addDoc, setDoc, updateDoc, deleteDoc, doc } =
    setupFirestoreRefs()

  beforeEach(() => {
    clearPendingPromises(firebaseApp)
  })

  function createMyApp<T>(
    setup: () => T,
    render: (ctx: ShallowUnwrapRef<Awaited<T>>) => unknown
  ) {
    const App = {
      ssrRender(ctx: any, push: any, _parent: any) {
        push(`<p>${ssrInterpolate(render(ctx))}</p>`)
      },
      setup,
    }

    const app = createSSRApp(App)

    return { app }
  }

  function factoryCollection<T = DocumentData>({
    options,
    ref = collection(),
  }: {
    options?: UseCollectionOptions
    ref?: _MaybeRef<_Nullable<CollectionReference<T>>>
  } = {}) {
    let data!: _RefFirestore<VueFirestoreQueryData<T>>

    const wrapper = mount({
      template: 'no',
      setup() {
        // @ts-expect-error: generic forced
        data =
          // split for ts
          useCollection(ref, options)
        const { data: list, pending, error, promise, unbind } = data
        return { list, pending, error, promise, unbind }
      },
    })

    return {
      wrapper,
      // to simplify types
      listRef: unref(ref)!,
      // non enumerable properties cannot be spread
      data: data.data,
      pending: data.pending,
      error: data.error,
      promise: data.promise,
      unbind: data.unbind,
    }
  }

  function factoryDoc<T = DocumentData>({
    options,
    ref,
  }: {
    options?: UseDocumentOptions
    ref?: _MaybeRef<DocumentReference<T>>
  } = {}) {
    let data!: _RefFirestore<VueFirestoreQueryData<T>>

    const wrapper = mount({
      template: 'no',
      setup() {
        // @ts-expect-error: generic forced
        data =
          // split for ts
          useDocument(ref, options)
        const { data: list, pending, error, promise, unbind } = data
        return { list, pending, error, promise, unbind }
      },
    })

    return {
      wrapper,
      listRef: unref(ref),
      // non enumerable properties cannot be spread
      data: data.data,
      pending: data.pending,
      error: data.error,
      promise: data.promise,
      unbind: data.unbind,
    }
  }

  it('can await within setup', async () => {
    const docRef = doc<{ name: string }>()
    await setDoc(docRef, { name: 'a' })
    const { app } = createMyApp(
      async () => {
        const { data, promise } = useDocument(docRef)
        await promise.value
        return { data }
      },
      ({ data }) => data.name
    )

    expect(await renderToString(app)).toBe(`<p>a</p>`)
  })

  it('can await outside of setup', async () => {
    const docRef = doc<{ name: string }>()
    await setDoc(docRef, { name: 'hello' })
    const { app } = createMyApp(
      () => {
        const data = useDocument(docRef)
        return { data }
      },
      ({ data }) => data.name
    )

    expect(await renderToString(app)).toBe(`<p>hello</p>`)
  })
})
