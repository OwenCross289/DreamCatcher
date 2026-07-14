/// <reference lib="WebWorker" />

export {}

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ revision?: string | null; url: string }>
}

const cacheName = 'dreamcatcher-precache-v1'
const offlineUrl = new URL('/offline.html', self.location.origin).href
const precacheUrls = new Set(
  self.__WB_MANIFEST.map(
    (entry) => new URL(entry.url, self.location.origin).href,
  ),
)

function isPrivateBackendPath(pathname: string) {
  return (
    pathname === '/api' ||
    pathname.startsWith('/api/') ||
    pathname === '/_serverFn' ||
    pathname.startsWith('/_serverFn/')
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => cache.addAll(Array.from(precacheUrls))),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName)
      const cachedRequests = await cache.keys()

      await Promise.all(
        cachedRequests
          .filter((request) => !precacheUrls.has(request.url))
          .map((request) => cache.delete(request)),
      )

      const ownedCaches = (await caches.keys()).filter(
        (name) =>
          name.startsWith('dreamcatcher-precache-') && name !== cacheName,
      )
      await Promise.all(ownedCaches.map((name) => caches.delete(name)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    void self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (
    url.origin !== self.location.origin ||
    isPrivateBackendPath(url.pathname)
  ) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const fallback = await caches.match(offlineUrl)
        return (
          fallback ??
          new Response('You are offline.', {
            status: 503,
            headers: { 'content-type': 'text/plain; charset=utf-8' },
          })
        )
      }),
    )
    return
  }

  if (precacheUrls.has(url.href)) {
    event.respondWith(
      caches
        .open(cacheName)
        .then(async (cache) => (await cache.match(request)) ?? fetch(request)),
    )
  }
})
