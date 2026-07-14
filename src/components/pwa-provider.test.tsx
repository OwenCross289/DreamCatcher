// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  PWA_UPDATE_CHECK_INTERVAL_MS,
  PwaProvider,
} from '#/components/pwa-provider'
import { configurePwaRegisterStub } from '#/test/pwa-register.stub'

function setNavigatorValue(key: string, value: unknown) {
  Object.defineProperty(navigator, key, { configurable: true, value })
}

function setVisibilityState(value: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value,
  })
}

function createRegistration(update: () => Promise<void>) {
  return { update } as unknown as ServiceWorkerRegistration
}

function renderProvider(child: React.ReactNode = <div>Journal</div>) {
  return render(<PwaProvider>{child}</PwaProvider>)
}

describe('PwaProvider', () => {
  beforeEach(() => {
    configurePwaRegisterStub()
    setNavigatorValue('onLine', true)
    setVisibilityState('visible')
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('does not intercept or render UI for browser install prompts', () => {
    const prompt = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    const event = new Event('beforeinstallprompt', { cancelable: true })
    Object.assign(event, {
      prompt,
      userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
    })

    renderProvider()
    fireEvent(window, event)

    expect(event.defaultPrevented).toBe(false)
    expect(prompt).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByText('Install app')).toBeNull()
  })

  it('announces connectivity loss', async () => {
    renderProvider()
    setNavigatorValue('onLine', false)
    fireEvent(window, new Event('offline'))

    expect(
      await screen.findByText(/Changes won’t save until you reconnect/),
    ).toBeTruthy()
  })

  it('checks for an update when the app becomes visible', async () => {
    const update = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    setVisibilityState('hidden')
    configurePwaRegisterStub({ registration: createRegistration(update) })
    renderProvider()

    setVisibilityState('visible')
    fireEvent(document, new Event('visibilitychange'))

    await waitFor(() => expect(update).toHaveBeenCalledOnce())
  })

  it('checks for an update when connectivity returns', async () => {
    const update = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    setNavigatorValue('onLine', false)
    configurePwaRegisterStub({ registration: createRegistration(update) })
    renderProvider()

    setNavigatorValue('onLine', true)
    fireEvent(window, new Event('online'))

    await waitFor(() => expect(update).toHaveBeenCalledOnce())
  })

  it('checks hourly while the app is open and visible', async () => {
    vi.useFakeTimers()
    const update = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    configurePwaRegisterStub({ registration: createRegistration(update) })
    renderProvider()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(PWA_UPDATE_CHECK_INTERVAL_MS)
    })

    expect(update).toHaveBeenCalledOnce()
  })

  it('does not poll while offline or hidden', async () => {
    vi.useFakeTimers()
    const update = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    setNavigatorValue('onLine', false)
    setVisibilityState('hidden')
    configurePwaRegisterStub({ registration: createRegistration(update) })
    renderProvider()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(PWA_UPDATE_CHECK_INTERVAL_MS)
    })

    expect(update).not.toHaveBeenCalled()
  })

  it('offers a controlled service-worker update', async () => {
    const update = vi
      .fn<(reloadPage?: boolean) => Promise<void>>()
      .mockResolvedValue(undefined)
    configurePwaRegisterStub({ needRefresh: true, update })
    renderProvider()

    expect(await screen.findByText('A new version is available')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }))

    await waitFor(() => expect(update).toHaveBeenCalledWith(true))
  })

  it('dismisses the update prompt without activating it', async () => {
    const update = vi
      .fn<(reloadPage?: boolean) => Promise<void>>()
      .mockResolvedValue(undefined)
    configurePwaRegisterStub({ needRefresh: true, update })
    renderProvider()

    fireEvent.click(await screen.findByRole('button', { name: 'Later' }))

    expect(screen.queryByText('A new version is available')).toBeNull()
    expect(update).not.toHaveBeenCalled()
  })
})
