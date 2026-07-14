import { StrictMode, startTransition } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import { registerPwaUpdateListener } from '#/register-pwa-update-listener'
import { getRouter } from '#/router'

registerPwaUpdateListener()

const router = getRouter()
const rootElement = document.getElementById('app')

if (!rootElement) {
  throw new Error('Root element #app was not found')
}

startTransition(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
})
