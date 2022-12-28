import { defineConfig } from 'vitest/config'

export default defineConfig({
  optimizeDeps: {
    exclude: ['vue-demi'],
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      reporter: ['text', 'json', 'html'],
      exclude: ['src/**/*.spec.ts', 'src/index.ts'],
    },
  },
})
