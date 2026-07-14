import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#': fileURLToPath(new URL('./src', import.meta.url)),
      'virtual:pwa-register/react': fileURLToPath(
        new URL('./src/test/pwa-register.stub.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
  },
})
