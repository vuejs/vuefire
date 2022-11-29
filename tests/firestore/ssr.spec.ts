/**
 * @vitest-environment node
 */
import { beforeEach, describe, it, expect } from 'vitest'
import { setupFirestoreRefs, firebaseApp } from '../utils'
import { ShallowUnwrapRef } from 'vue'
import { _InferReferenceType, _RefFirestore } from '../../src/firestore'
import { useDocument } from '../../src'
import { _MaybeRef, _Nullable } from '../../src/shared'
import { createSSRApp } from 'vue'
import { renderToString, ssrInterpolate } from '@vue/server-renderer'
import { clearPendingPromises } from '../../src/ssr/plugin'

describe('Firestore SSR', async () => {
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

  it('can await within setup', async () => {
    const docRef = doc<{ name: string }>()
    await setDoc(docRef, { name: 'a' })
    const { app } = createMyApp(
      async () => {
        const { data, promise } = useDocument(docRef)
        await promise.value
        return { data }
      },
      ({ data }) => data?.name
    )

    expect(await renderToString(app)).toBe(`<p>a</p>`)
  })

  it('works without await', async () => {
    const docRef = doc<{ name: string }>()
    await setDoc(docRef, { name: 'hello' })
    const { app } = createMyApp(
      () => {
        const data = useDocument(docRef)
        return { data }
      },
      ({ data }) => data?.name
    )

    expect(await renderToString(app)).toBe(`<p>hello</p>`)
  })
})
