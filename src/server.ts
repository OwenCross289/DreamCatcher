import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'

const startHandler = createStartHandler(defaultStreamHandler)
const backendPrefixes = ['/api', '/_serverFn']

let shellHtml: Promise<string> | undefined

function isBackendRequest(pathname: string) {
  return backendPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

function getShellHtml() {
  shellHtml ??= readFile(
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      '..',
      '..',
      'public',
      '_shell.html',
    ),
    'utf8',
  )

  return shellHtml
}

export default {
  async fetch(
    request: Request,
    requestOptions?: Parameters<typeof startHandler>[1],
  ) {
    const pathname = new URL(request.url).pathname
    const isGeneratingShell =
      request.headers.get('x-tss-shell')?.toLowerCase() === 'true'

    if (
      import.meta.env.DEV ||
      process.env.TSS_PRERENDERING === 'true' ||
      isGeneratingShell ||
      isBackendRequest(pathname)
    ) {
      return startHandler(request, requestOptions)
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, {
        status: 405,
        headers: { allow: 'GET, HEAD' },
      })
    }

    return new Response(
      request.method === 'HEAD' ? null : await getShellHtml(),
      {
        headers: {
          'cache-control': 'no-cache',
          'content-type': 'text/html; charset=utf-8',
        },
      },
    )
  },
}
