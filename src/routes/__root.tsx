import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
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
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  notFoundComponent: () => (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="font-display text-7xl text-primary">404</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">
          This dream has drifted away
        </h1>
        <a
          href="/"
          className="mt-5 inline-block font-semibold text-primary underline"
        >
          Return to your journal
        </a>
      </div>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
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
