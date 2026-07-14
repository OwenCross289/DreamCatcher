import { registerSW } from 'virtual:pwa-register'

export const PWA_UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

export interface PwaSnapshot {
  isOnline: boolean
  updateAvailable: boolean
}

const serverSnapshot: PwaSnapshot = {
  isOnline: true,
  updateAvailable: false,
}

let snapshot = serverSnapshot
let registration: ServiceWorkerRegistration | undefined
let updateServiceWorker: (
  reloadPage?: boolean,
) => Promise<void> = async () => {}
let started = false
const listeners = new Set<() => void>()

function updateSnapshot(patch: Partial<PwaSnapshot>) {
  const nextSnapshot = { ...snapshot, ...patch }

  if (
    nextSnapshot.isOnline === snapshot.isOnline &&
    nextSnapshot.updateAvailable === snapshot.updateAvailable
  ) {
    return
  }

  snapshot = nextSnapshot
  listeners.forEach((listener) => listener())
}

function showWaitingUpdate() {
  if (registration?.waiting) updateSnapshot({ updateAvailable: true })
}

async function checkForUpdate() {
  if (
    !registration ||
    !navigator.onLine ||
    document.visibilityState !== 'visible'
  ) {
    return
  }

  try {
    await registration.update()
    showWaitingUpdate()
  } catch (error) {
    console.error('Service worker update check failed', error)
  }
}

export function registerPwaUpdateListener() {
  if (started || typeof window === 'undefined') return
  started = true

  const handleOnline = () => {
    updateSnapshot({ isOnline: true })
    void checkForUpdate()
  }
  const handleOffline = () => updateSnapshot({ isOnline: false })
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') void checkForUpdate()
  }

  updateSnapshot({ isOnline: navigator.onLine })
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.setInterval(() => void checkForUpdate(), PWA_UPDATE_CHECK_INTERVAL_MS)

  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateSnapshot({ updateAvailable: true })
    },
    onRegisteredSW(_serviceWorkerUrl, serviceWorkerRegistration) {
      registration = serviceWorkerRegistration
      showWaitingUpdate()
    },
    onRegisterError(error) {
      console.error('Service worker registration failed', error)
    },
  })
}

export function subscribeToPwa(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getPwaSnapshot() {
  return snapshot
}

export function getPwaServerSnapshot() {
  return serverSnapshot
}

export function dismissPwaUpdate() {
  updateSnapshot({ updateAvailable: false })
}

export async function applyPwaUpdate() {
  await updateServiceWorker(true)
}
