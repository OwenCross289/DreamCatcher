import { describe, expect, it } from 'vitest'

import { getAllowedEmails, isEmailAllowed } from './allowlist'

describe('email allowlist', () => {
  it('normalizes case and whitespace', () => {
    const allowed = getAllowedEmails(' One@Example.com, two@example.com ')

    expect(isEmailAllowed('one@example.com', allowed)).toBe(true)
    expect(isEmailAllowed(' TWO@EXAMPLE.COM ', allowed)).toBe(true)
  })

  it('rejects any account that was not explicitly listed', () => {
    const allowed = getAllowedEmails('one@example.com,two@example.com')

    expect(isEmailAllowed('someone-else@example.com', allowed)).toBe(false)
    expect(isEmailAllowed('', allowed)).toBe(false)
  })

  it('defaults to denying everyone when configuration is empty', () => {
    expect(getAllowedEmails('')).toEqual(new Set())
    expect(isEmailAllowed('one@example.com', new Set())).toBe(false)
  })
})
