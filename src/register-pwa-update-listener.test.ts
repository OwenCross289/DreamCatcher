// @vitest-environment jsdom

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  PWA_UPDATE_CHECK_INTERVAL_MS,
  applyPwaUpdate,
  dismissPwaUpdate,
  getPwaSnapshot,
  registerPwaUpdateListener,
} from '#/register-pwa-update-listener'
import {
  configurePwaRegisterStub,
  getPwaRegisterOptions,
} from '#/test/pwa-register.stub'

function setNavigatorOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value })
}

function setVisibilityState(value: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value,
  })
}

describe('registerPwaUpdateListener', () => {
  const registrationUpdate = vi.fn<() => Promise<void>>()
  const activateUpdate = vi.fn<(reloadPage?: boolean) => Promise<void>>()
  const registration = {
    update: registrationUpdate,
    waiting: null,
  } as unknown as ServiceWorkerRegistration

  beforeAll(() => {
    vi.useFakeTimers()
    setNavigatorOnline(true)
    setVisibilityState('visible')
    registrationUpdate.mockResolvedValue(undefined)
    activateUpdate.mockResolvedValue(undefined)
    configurePwaRegisterStub({ update: activateUpdate })
    registerPwaUpdateListener()
  })

  afterAll(() => vi.useRealTimers())

  it('registers immediately from TypeScript and exposes the update lifecycle', async () => {
    const options = getPwaRegisterOptions()

    expect(options?.immediate).toBe(true)

    options?.onRegisteredSW?.('/sw.js', registration)
    options?.onNeedRefresh?.()
    expect(getPwaSnapshot().updateAvailable).toBe(true)

    dismissPwaUpdate()
    expect(getPwaSnapshot().updateAvailable).toBe(false)

    await applyPwaUpdate()
    expect(activateUpdate).toHaveBeenCalledWith(true)

    await vi.advanceTimersByTimeAsync(PWA_UPDATE_CHECK_INTERVAL_MS)
    expect(registrationUpdate).toHaveBeenCalledOnce()
  })

  it('detects a worker that was already waiting when registration completed', () => {
    const waitingRegistration = {
      update: registrationUpdate,
      waiting: {},
    } as unknown as ServiceWorkerRegistration

    dismissPwaUpdate()
    getPwaRegisterOptions()?.onRegisteredSW?.('/sw.js', waitingRegistration)

    expect(getPwaSnapshot().updateAvailable).toBe(true)
  })
})
