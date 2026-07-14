import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://dreamcatcher:dreamcatcher@localhost:5433/dreamcatcher',
  },
  strict: true,
  verbose: true,
})
