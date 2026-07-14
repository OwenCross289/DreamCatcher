import {
  Download,
  RefreshCw,
  Share,
  SquarePlus,
  WifiOff,
  X,
} from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

import { Button } from '#/components/ui/button'

type InstallChoice = {
  outcome: 'accepted' | 'dismissed'
  platform: string
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<InstallChoice>
}

type PwaContextValue = {
  canInstall: boolean
  install: () => Promise<void>
  isOnline: boolean
  isStandalone: boolean
  updateAvailable: boolean
  applyUpdate: () => Promise<void>
}

const PwaContext = createContext<PwaContextValue | null>(null)

export function isIosDevice({
  userAgent,
  platform,
  maxTouchPoints,
}: {
  userAgent: string
  platform: string
  maxTouchPoints: number
}) {
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === 'MacIntel' && maxTouchPoints > 1)
  )
}

export function isStandaloneDisplay(
  displayModeMatches: boolean,
  navigatorStandalone: boolean | undefined,
) {
  return displayModeMatches || navigatorStandalone === true
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const {
    needRefresh: [updateAvailable, setUpdateAvailable],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('Service worker registration failed', error)
    },
  })
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const displayMode = window.matchMedia('(display-mode: standalone)')
    const navigatorWithStandalone = navigator as Navigator & {
      standalone?: boolean
    }

    function syncStandalone() {
      setIsStandalone(
        isStandaloneDisplay(
          displayMode.matches,
          navigatorWithStandalone.standalone,
        ),
      )
    }

    function captureInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    function handleInstalled() {
      setDeferredPrompt(null)
      setShowIosHelp(false)
      setIsStandalone(true)
    }

    function handleOnline() {
      setIsOnline(true)
    }

    function handleOffline() {
      setIsOnline(false)
    }

    setIsIos(
      isIosDevice({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        maxTouchPoints: navigator.maxTouchPoints,
      }),
    )
    setIsOnline(navigator.onLine)
    syncStandalone()

    window.addEventListener('beforeinstallprompt', captureInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    displayMode.addEventListener('change', syncStandalone)

    return () => {
      window.removeEventListener('beforeinstallprompt', captureInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      displayMode.removeEventListener('change', syncStandalone)
    }
  }, [])

  useEffect(() => {
    if (!showIosHelp) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setShowIosHelp(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [showIosHelp])

  const install = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return
    }

    if (isIos && !isStandalone) setShowIosHelp(true)
  }, [deferredPrompt, isIos, isStandalone])

  const applyUpdate = useCallback(async () => {
    setIsUpdating(true)
    try {
      await updateServiceWorker(true)
    } catch (error) {
      console.error('Service worker update failed', error)
      setIsUpdating(false)
    }
  }, [updateServiceWorker])

  const value = useMemo<PwaContextValue>(
    () => ({
      canInstall: !isStandalone && (deferredPrompt !== null || isIos === true),
      install,
      isOnline,
      isStandalone,
      updateAvailable,
      applyUpdate,
    }),
    [
      applyUpdate,
      deferredPrompt,
      install,
      isIos,
      isOnline,
      isStandalone,
      updateAvailable,
    ],
  )

  return (
    <PwaContext.Provider value={value}>
      {children}

      {!isOnline && (
        <output className="fixed top-3 left-1/2 z-[100] flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur">
          <WifiOff className="size-4 text-muted-foreground" />
          You’re offline. Changes won’t save until you reconnect.
        </output>
      )}

      {updateAvailable && (
        <aside
          aria-live="polite"
          className="fixed right-4 bottom-4 z-[100] w-[min(24rem,calc(100%-2rem))] rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur"
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

      {showIosHelp && (
        <div className="fixed inset-0 z-[110] grid place-items-end bg-black/45 p-3 sm:place-items-center">
          <dialog
            open
            aria-labelledby="install-dreamcatcher-title"
            className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Download className="size-5" />
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close installation instructions"
                onClick={() => setShowIosHelp(false)}
              >
                <X />
              </Button>
            </div>
            <h2
              id="install-dreamcatcher-title"
              className="mt-5 font-display text-2xl font-semibold"
            >
              Install Dreamcatcher
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Add the journal to your Home Screen for a full-screen app
              experience.
            </p>
            <ol className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Share className="size-5 shrink-0 text-primary" />
                Tap the Share button in Safari.
              </li>
              <li className="flex items-center gap-3">
                <SquarePlus className="size-5 shrink-0 text-primary" />
                Choose “Add to Home Screen”.
              </li>
            </ol>
            <Button
              className="mt-6 w-full"
              onClick={() => setShowIosHelp(false)}
            >
              Got it
            </Button>
          </dialog>
        </div>
      )}
    </PwaContext.Provider>
  )
}

export function usePwa() {
  const context = useContext(PwaContext)
  if (!context) throw new Error('usePwa must be used within PwaProvider')
  return context
}
