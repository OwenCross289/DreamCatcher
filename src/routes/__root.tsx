import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { RefreshCw, WifiOff } from 'lucide-react'
import type { ErrorComponentProps } from '@tanstack/react-router'

import { PwaProvider } from '#/components/pwa-provider'
import { ThemeProvider } from '#/components/theme-provider'
import { Button } from '#/components/ui/button'

import appCss from '../styles.css?url'

const themeBootScript = `
  (() => {
    const saved = localStorage.getItem('dreamcatcher-theme') || 'system';
    const dark = saved === 'dark' || (saved === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  })();
`

export const Route = createRootRoute({
  component: RootLayout,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      {
        name: 'theme-color',
        content: '#f3eafb',
        media: '(prefers-color-scheme: light)',
      },
      {
        name: 'theme-color',
        content: '#181525',
        media: '(prefers-color-scheme: dark)',
      },
      {
        name: 'mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'Dreamcatcher',
      },
      {
        title: 'Dreamcatcher · Keep the worlds you visit',
      },
      {
        name: 'description',
        content:
          'A private, illustrated journal for the dreams you want to remember.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  errorComponent: RootRouteError,
  notFoundComponent: () => (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="font-display text-7xl text-primary">404</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">
          This dream has drifted away
        </h1>
        <a
          href="/home"
          className="mt-5 inline-block font-semibold text-primary underline"
        >
          Return to your journal
        </a>
      </div>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootLayout() {
  return (
    <ThemeProvider>
      <PwaProvider>
        <Outlet />
      </PwaProvider>
    </ThemeProvider>
  )
}

function RootRouteError({ reset }: ErrorComponentProps) {
  const offline = typeof navigator !== 'undefined' && !navigator.onLine
  const Icon = offline ? WifiOff : RefreshCw

  return (
    <main className="grid min-h-svh place-items-center p-6 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-6" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold">
          {offline ? 'Your dreams are still safe' : 'Something drifted away'}
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {offline
            ? 'Reconnect to open this part of your private journal.'
            : 'Dreamcatcher could not load this page. Please try again.'}
        </p>
        <Button className="mt-6" onClick={reset}>
          <RefreshCw />
          Try again
        </Button>
      </div>
    </main>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  if (typeof document !== 'undefined') return children

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <HeadContent />
      </head>
      <body>
        <div id="app">{children}</div>
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[
              {
                name: 'TanStack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  )
}
