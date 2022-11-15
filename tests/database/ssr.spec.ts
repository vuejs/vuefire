/**
 * @vitest-environment node
 */
import { beforeEach, describe, it, expect } from 'vitest'
import { setupFirestoreRefs, firebaseApp, setupDatabaseRefs } from '../utils'
import { ShallowUnwrapRef } from 'vue'
import { _InferReferenceType, _RefFirestore } from '../../src/firestore'
import { useDocument, useObject } from '../../src'
import { _MaybeRef, _Nullable } from '../../src/shared'
import { createSSRApp } from 'vue'
import { renderToString, ssrInterpolate } from '@vue/server-renderer'
import { clearPendingPromises } from '../../src/ssr/plugin'

describe('Database SSR', async () => {
  const { databaseRef, set } = setupDatabaseRefs()

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
    const docRef = databaseRef()
    await set(docRef, { name: 'a' })
    const { app } = createMyApp(
      async () => {
        const { data, promise } = useObject<{ name: string }>(docRef)
        await promise.value
        return { data }
      },
      ({ data }) => data!.name
    )

    expect(await renderToString(app)).toBe(`<p>a</p>`)
  })

  it('works without await', async () => {
    const docRef = databaseRef()
    await set(docRef, { name: 'hello' })
    const { app } = createMyApp(
      () => {
        const data = useObject<{ name: string }>(docRef)
        return { data }
      },
      ({ data }) => data!.name
    )

    expect(await renderToString(app)).toBe(`<p>hello</p>`)
  })
})
