import { createFileRoute } from '@tanstack/react-router'
import { sql } from 'drizzle-orm'

import { db } from '#/db/index.server'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        try {
          await db.execute(sql`select 1`)
          return Response.json({ status: 'healthy' })
        } catch {
          return Response.json({ status: 'unhealthy' }, { status: 503 })
        }
      },
    },
  },
})
