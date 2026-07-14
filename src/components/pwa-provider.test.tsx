// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PwaProvider } from '#/components/pwa-provider'

const pwa = vi.hoisted(() => {
  let snapshot = { isOnline: true, updateAvailable: false }
  const listeners = new Set<() => void>()
  const applyPwaUpdate = vi.fn<() => Promise<void>>()

  return {
    applyPwaUpdate,
    dismissPwaUpdate() {
      snapshot = { ...snapshot, updateAvailable: false }
      listeners.forEach((listener) => listener())
    },
    getPwaServerSnapshot: () => ({
      isOnline: true,
      updateAvailable: false,
    }),
    getPwaSnapshot: () => snapshot,
    reset() {
      snapshot = { isOnline: true, updateAvailable: false }
      applyPwaUpdate.mockReset().mockResolvedValue(undefined)
    },
    setSnapshot(patch: Partial<typeof snapshot>) {
      snapshot = { ...snapshot, ...patch }
      listeners.forEach((listener) => listener())
    },
    subscribeToPwa(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
})

vi.mock('#/register-pwa-update-listener', () => pwa)

function renderProvider(child: React.ReactNode = <div>Journal</div>) {
  return render(<PwaProvider>{child}</PwaProvider>)
}

describe('PwaProvider', () => {
  beforeEach(() => pwa.reset())

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
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
    pwa.setSnapshot({ isOnline: false })

    expect(await screen.findByText(/Changes won/)).toBeTruthy()
  })

  it('offers a controlled service-worker update', async () => {
    renderProvider()
    pwa.setSnapshot({ updateAvailable: true })

    expect(await screen.findByText('A new version is available')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }))

    await waitFor(() => expect(pwa.applyPwaUpdate).toHaveBeenCalledOnce())
  })

  it('dismisses the update prompt without activating it', async () => {
    renderProvider()
    pwa.setSnapshot({ updateAvailable: true })

    fireEvent.click(await screen.findByRole('button', { name: 'Later' }))

    expect(screen.queryByText('A new version is available')).toBeNull()
    expect(pwa.applyPwaUpdate).not.toHaveBeenCalled()
  })
})
