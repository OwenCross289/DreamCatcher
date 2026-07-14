import { redirect } from '@tanstack/react-router'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth.server'
import { isEmailAllowed } from '#/lib/allowlist'

export async function getCurrentSession() {
  return auth.api.getSession({ headers: getRequestHeaders() })
}

export async function requireCurrentUser() {
  const session = await getCurrentSession()

  if (!session || !isEmailAllowed(session.user.email)) {
    throw redirect({ to: '/sign-in' })
  }

  return session.user
}
