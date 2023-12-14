import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      reporter: ['text', 'json', 'html'],
      // exclude: ['src/**/*.spec.ts', 'src/index.ts'],
    },
  },
})
