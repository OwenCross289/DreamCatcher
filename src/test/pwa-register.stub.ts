import { useState } from 'react'

type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>

let initialNeedRefresh = false
let updateServiceWorker: UpdateServiceWorker = async () => {}

export function configurePwaRegisterStub({
  needRefresh = false,
  update = async () => {},
}: {
  needRefresh?: boolean
  update?: UpdateServiceWorker
} = {}) {
  initialNeedRefresh = needRefresh
  updateServiceWorker = update
}

export function useRegisterSW() {
  return {
    needRefresh: useState(initialNeedRefresh),
    offlineReady: useState(false),
    updateServiceWorker,
  }
}
