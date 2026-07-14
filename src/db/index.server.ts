import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://dreamcatcher:dreamcatcher@localhost:5433/dreamcatcher'

export const pool = new Pool({
  connectionString,
  max: Number(process.env.DATABASE_POOL_SIZE ?? 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

export const db = drizzle({ client: pool, schema })
