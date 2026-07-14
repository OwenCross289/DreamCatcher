import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { db } from '#/db/index.server'
import * as schema from '#/db/schema'
import { isEmailAllowed } from '#/lib/allowlist'

export const auth = betterAuth({
  appName: 'Dreamcatcher',
  baseURL: process.env.BETTER_AUTH_URL,
  secret:
    process.env.BETTER_AUTH_SECRET ??
    'local-development-secret-change-before-deploying',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: { enabled: false },
  socialProviders: {
    google: {
      clientId:
        process.env.GOOGLE_CLIENT_ID ?? 'google-client-id-not-configured',
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ??
        'google-client-secret-not-configured',
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => isEmailAllowed(newUser.email),
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  plugins: [tanstackStartCookies()],
})
