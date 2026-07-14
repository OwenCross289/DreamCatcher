import { RefreshCw, WifiOff } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

import { Button } from '#/components/ui/button'

export const PWA_UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>()
  const {
    needRefresh: [updateAvailable, setUpdateAvailable],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_serviceWorkerUrl, serviceWorkerRegistration) {
      setRegistration(serviceWorkerRegistration)
    },
    onRegisterError(error) {
      console.error('Service worker registration failed', error)
    },
  })
  const [isOnline, setIsOnline] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }

    function handleOffline() {
      setIsOnline(false)
    }

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!registration) return

    function checkForUpdate() {
      if (!navigator.onLine || document.visibilityState !== 'visible') return

      void registration?.update().catch((error: unknown) => {
        console.error('Service worker update check failed', error)
      })
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') checkForUpdate()
    }

    const intervalId = window.setInterval(
      checkForUpdate,
      PWA_UPDATE_CHECK_INTERVAL_MS,
    )
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', checkForUpdate)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', checkForUpdate)
    }
  }, [registration])

  const applyUpdate = useCallback(async () => {
    setIsUpdating(true)
    try {
      await updateServiceWorker(true)
    } catch (error) {
      console.error('Service worker update failed', error)
      setIsUpdating(false)
    }
  }, [updateServiceWorker])

  return (
    <>
      {children}

      {!isOnline && (
        <output className="fixed top-[calc(env(safe-area-inset-top)+0.75rem)] left-1/2 z-[100] flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur">
          <WifiOff className="size-4 text-muted-foreground" />
          You’re offline. Changes won’t save until you reconnect.
        </output>
      )}

      {updateAvailable && (
        <aside
          aria-live="polite"
          className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-[100] w-[min(24rem,calc(100%-2rem))] rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <RefreshCw className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">A new version is available</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Reload when you’re ready to use the latest Dreamcatcher.
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isUpdating}
              onClick={() => setUpdateAvailable(false)}
            >
              Later
            </Button>
            <Button size="sm" disabled={isUpdating} onClick={applyUpdate}>
              <RefreshCw className={isUpdating ? 'animate-spin' : undefined} />
              {isUpdating ? 'Updating…' : 'Reload'}
            </Button>
          </div>
        </aside>
      )}
    </>
  )
}
