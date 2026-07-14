import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'

import { db } from '#/db/index.server'
import { dreams } from '#/db/schema'
import { auth } from '#/lib/auth.server'
import { isEmailAllowed } from '#/lib/allowlist'

export const Route = createFileRoute('/api/dreams/$dreamId/image')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session || !isEmailAllowed(session.user.email)) {
          return new Response('Unauthorized', {
            status: 401,
            headers: { 'Cache-Control': 'no-store' },
          })
        }

        const rows = await db
          .select({
            imageData: dreams.imageData,
            imageMimeType: dreams.imageMimeType,
            updatedAt: dreams.updatedAt,
          })
          .from(dreams)
          .where(
            and(
              eq(dreams.id, params.dreamId),
              eq(dreams.userId, session.user.id),
            ),
          )
          .limit(1)
        const dream = rows.at(0)

        if (!dream || !dream.imageData) {
          return new Response('Image not found', {
            status: 404,
            headers: { 'Cache-Control': 'no-store' },
          })
        }

        return new Response(new Uint8Array(dream.imageData), {
          headers: {
            'Content-Type': dream.imageMimeType ?? 'image/png',
            'Cache-Control': 'private, max-age=31536000, immutable',
            'Last-Modified': dream.updatedAt.toUTCString(),
            'X-Content-Type-Options': 'nosniff',
          },
        })
      },
    },
  },
})
