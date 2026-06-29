import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    alias: {
      '@repo/document-model': path.resolve(__dirname, './packages/document-model/src/index.ts'),
      '@repo/design-tokens': path.resolve(__dirname, './packages/design-tokens/src/index.ts'),
      'puppeteer-core': path.resolve(__dirname, './tests/mocks/puppeteer-core.ts'),
    },
  },
})
