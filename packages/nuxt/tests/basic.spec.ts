import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe.skip('ssr', async () => {
  await setup({
    rootDir: path.join(__dirname, './fixtures/basic'),
  })

  it('renders the index page', async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch('/')
    expect(html).toContain('<div>basic</div>')
  })
})
