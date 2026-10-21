import { describe, expect, it } from 'vitest'
import { firebaseAdminCjsPlugin } from '../src/module/firebase-admin-cjs'

const wrapperId = '/project/node_modules/firebase-admin/lib/esm/app/index.js'
const wrapper = `import mod from "../../app/index.js";

export const getApps = mod.getApps;
export const initializeApp = mod.initializeApp;
`

function transform(code: string, id: string, ssr: boolean) {
  const plugin = firebaseAdminCjsPlugin()
  // @ts-expect-error: called without a plugin context, which the hook does not use
  return plugin.transform(code, id, { ssr })
}

describe('firebaseAdminCjsPlugin', () => {
  it('loads the CommonJS file with require in SSR', () => {
    const result = transform(wrapper, wrapperId, true)
    expect(result.code).toContain(
      `import { createRequire } from 'node:module'; const mod = createRequire(import.meta.url)("../../app/index.js");`
    )
    expect(result.code).not.toContain('import mod from')
    expect(result.code.split('\n')).toHaveLength(wrapper.split('\n').length)
    expect(result.code).toContain('export const getApps = mod.getApps;')
  })

  it('handles Windows paths', () => {
    const result = transform(
      wrapper,
      'C:\\project\\node_modules\\firebase-admin\\lib\\esm\\app\\index.js',
      true
    )
    expect(result.code).toContain('createRequire')
  })

  it('leaves the client build alone', () => {
    expect(transform(wrapper, wrapperId, false)).toBeUndefined()
  })

  it('leaves other modules alone', () => {
    expect(
      transform(wrapper, '/project/node_modules/other/lib/esm/index.js', true)
    ).toBeUndefined()
    expect(
      transform(
        'export const a = 1\n',
        '/project/node_modules/firebase-admin/lib/esm/app/index.js',
        true
      )
    ).toBeUndefined()
  })

  it('only applies to the dev server', () => {
    expect(firebaseAdminCjsPlugin().apply).toBe('serve')
  })
})
