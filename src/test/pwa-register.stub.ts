import { useEffect, useState } from 'react'
import type { RegisterSWOptions } from 'vite-plugin-pwa/types'

type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>

let initialNeedRefresh = false
let updateServiceWorker: UpdateServiceWorker = async () => {}
let serviceWorkerRegistration: ServiceWorkerRegistration | undefined

export function configurePwaRegisterStub({
  needRefresh = false,
  update = async () => {},
  registration,
}: {
  needRefresh?: boolean
  update?: UpdateServiceWorker
  registration?: ServiceWorkerRegistration
} = {}) {
  initialNeedRefresh = needRefresh
  updateServiceWorker = update
  serviceWorkerRegistration = registration
}

export function useRegisterSW(options: RegisterSWOptions = {}) {
  const { onRegisteredSW } = options

  useEffect(() => {
    onRegisteredSW?.('/sw.js', serviceWorkerRegistration)
  }, [onRegisteredSW])

  return {
    needRefresh: useState(initialNeedRefresh),
    offlineReady: useState(false),
    updateServiceWorker,
  }
}
