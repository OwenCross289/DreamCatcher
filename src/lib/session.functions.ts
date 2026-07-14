import { createServerFn } from '@tanstack/react-start'

import { requireCurrentUser } from '#/lib/session.server'

export const getViewer = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireCurrentUser()
  return { name: user.name, email: user.email, image: user.image }
})
