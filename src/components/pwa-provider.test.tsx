// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  PwaProvider,
  isIosDevice,
  isStandaloneDisplay,
  usePwa,
} from '#/components/pwa-provider'
import { configurePwaRegisterStub } from '#/test/pwa-register.stub'

function setNavigatorValue(key: string, value: unknown) {
  Object.defineProperty(navigator, key, { configurable: true, value })
}

function installMatchMedia(matches = false) {
  const mediaQueryList = {
    matches,
    media: '(display-mode: standalone)',
    onchange: null,
    addEventListener: vi.fn<MediaQueryList['addEventListener']>(),
    removeEventListener: vi.fn<MediaQueryList['removeEventListener']>(),
    addListener: vi.fn<MediaQueryList['addListener']>(),
    removeListener: vi.fn<MediaQueryList['removeListener']>(),
    dispatchEvent: vi
      .fn<MediaQueryList['dispatchEvent']>()
      .mockReturnValue(true),
  } satisfies MediaQueryList

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi
      .fn<(query: string) => MediaQueryList>()
      .mockReturnValue(mediaQueryList),
  })
}

function InstallProbe() {
  const { canInstall, install, isStandalone } = usePwa()

  return (
    <div>
      {canInstall && (
        <button onClick={() => void install()}>Install app</button>
      )}
      <span>{isStandalone ? 'standalone' : 'browser'}</span>
    </div>
  )
}

function renderProvider(child: React.ReactNode = <InstallProbe />) {
  return render(<PwaProvider>{child}</PwaProvider>)
}

describe('PWA browser detection', () => {
  it('recognizes iOS and iPadOS desktop-mode user agents', () => {
    expect(
      isIosDevice({
        userAgent: 'Mozilla/5.0 (iPhone)',
        platform: 'iPhone',
        maxTouchPoints: 5,
      }),
    ).toBe(true)
    expect(
      isIosDevice({
        userAgent: 'Mozilla/5.0 (Macintosh)',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      }),
    ).toBe(true)
  })

  it('recognizes browser and navigator standalone modes', () => {
    expect(isStandaloneDisplay(true, false)).toBe(true)
    expect(isStandaloneDisplay(false, true)).toBe(true)
    expect(isStandaloneDisplay(false, false)).toBe(false)
  })
})

describe('PwaProvider', () => {
  beforeEach(() => {
    configurePwaRegisterStub()
    installMatchMedia()
    setNavigatorValue('userAgent', 'Mozilla/5.0 (Windows NT 10.0)')
    setNavigatorValue('platform', 'Win32')
    setNavigatorValue('maxTouchPoints', 0)
    setNavigatorValue('onLine', true)
    setNavigatorValue('standalone', false)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('captures and consumes the browser install prompt', async () => {
    const prompt = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    const event = new Event('beforeinstallprompt', { cancelable: true })
    Object.assign(event, {
      prompt,
      userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
    })

    renderProvider()
    fireEvent(window, event)
    fireEvent.click(await screen.findByRole('button', { name: 'Install app' }))

    await waitFor(() => expect(prompt).toHaveBeenCalledOnce())
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Install app' })).toBeNull(),
    )
  })

  it('shows iOS Home Screen instructions instead of a browser prompt', async () => {
    setNavigatorValue('userAgent', 'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15')
    setNavigatorValue('platform', 'iPhone')
    setNavigatorValue('maxTouchPoints', 5)

    renderProvider()
    fireEvent.click(await screen.findByRole('button', { name: 'Install app' }))

    expect(
      await screen.findByRole('dialog', { name: 'Install Dreamcatcher' }),
    ).toBeTruthy()
    expect(screen.getByText(/Add to Home Screen/)).toBeTruthy()
  })

  it('does not offer installation when already running standalone', async () => {
    installMatchMedia(true)
    renderProvider()

    await waitFor(() => expect(screen.getByText('standalone')).toBeTruthy())
    expect(screen.queryByRole('button', { name: 'Install app' })).toBeNull()
  })

  it('announces connectivity loss', async () => {
    renderProvider(<div>Journal</div>)
    setNavigatorValue('onLine', false)
    fireEvent(window, new Event('offline'))

    expect(
      await screen.findByText(/Changes won’t save until you reconnect/),
    ).toBeTruthy()
  })

  it('offers a controlled service-worker update', async () => {
    const update = vi
      .fn<(reloadPage?: boolean) => Promise<void>>()
      .mockResolvedValue(undefined)
    configurePwaRegisterStub({ needRefresh: true, update })
    renderProvider(<div>Journal</div>)

    expect(await screen.findByText('A new version is available')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }))

    await waitFor(() => expect(update).toHaveBeenCalledWith(true))
  })

  it('dismisses the update prompt without activating it', async () => {
    const update = vi
      .fn<(reloadPage?: boolean) => Promise<void>>()
      .mockResolvedValue(undefined)
    configurePwaRegisterStub({ needRefresh: true, update })
    renderProvider(<div>Journal</div>)

    fireEvent.click(await screen.findByRole('button', { name: 'Later' }))

    expect(screen.queryByText('A new version is available')).toBeNull()
    expect(update).not.toHaveBeenCalled()
  })
})
