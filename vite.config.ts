import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

function routeApiRequestsThroughNitro(): Plugin {
  return {
    name: 'dreamcatcher:route-api-requests-through-nitro',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost')
          .pathname

        if (pathname === '/api' || pathname.startsWith('/api/')) {
          request.headers['sec-fetch-dest'] = 'empty'
        }

        next()
      })
    },
  }
}

const config = defineConfig({
  preview: {
    host: '127.0.0.1',
  },
  optimizeDeps: {
    include: ['@tanstack/react-store'],
  },
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      '@tanstack/react-store',
      'use-sync-external-store',
    ],
    tsconfigPaths: true,
  },
  plugins: [
    routeApiRequestsThroughNitro(),
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
      },
    }),
    viteReact(),
  ],
})

export default config
