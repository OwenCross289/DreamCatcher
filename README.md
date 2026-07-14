# Dreamcatcher

A private dream journal for two people. Each entry keeps the remembered story in PostgreSQL and uses OpenAI image generation through TanStack AI to turn it into an illustration.

The repository is public; the journal is not. Google is the only sign-in method, new users are rejected unless their email is in the server-side allowlist, every query is scoped to the signed-in user, and generated images are delivered through an authenticated endpoint.

## Stack

- [TanStack Start](https://tanstack.com/start/latest) on Vite and React
- [TanStack AI](https://tanstack.com/ai/latest/docs/media/image-generation) with the OpenAI adapter
- [Better Auth](https://better-auth.com/docs/installation) with Google OAuth
- [shadcn/ui](https://ui.shadcn.com/) components and Tailwind CSS
- PostgreSQL 18 with Drizzle ORM and versioned migrations
- Nitro's Node server preset, packaged as a Docker image
- GitHub Actions, GHCR, Tailscale, and Dokploy deployment

## What it does

- Google SSO with a case-insensitive two-address allowlist
- A personal journal view; users never see one another's entries
- Dream title, date, story, mood, and visual style
- One wide `gpt-image-2` illustration generated when a dream is saved
- Original image bytes stored in PostgreSQL, avoiding a separate public object store
- Authenticated image responses, regeneration, and permanent deletion
- Failure-safe creation: the written dream remains saved if OpenAI is unavailable
- Health endpoint at `/api/health`

## Local setup

Requirements: Node.js 26, pnpm 11.9.0, Docker, a Google OAuth web client, and an OpenAI API key.

1. Create local configuration:

   ```bash
   cp .env.example .env
   ```

2. Fill in `.env`. Keep `AUTH_ALLOWED_EMAILS` to the exact two Google addresses that should have access.

3. Start PostgreSQL and apply migrations:

   ```bash
   docker compose up -d postgres
   pnpm install --frozen-lockfile
   pnpm run db:migrate
   ```

4. Start the app:

   ```bash
   pnpm run dev
   ```

The journal is available at [http://localhost:3000](http://localhost:3000).

To test the production application image locally, start the isolated test stack:

```bash
docker compose -f test-compose.yml up --build --wait
```

The containerized app is available at
[http://localhost:3000](http://localhost:3000), using the same origin and Google
OAuth callback as the development server. Stop the development server before
starting this stack. The stack uses its own PostgreSQL database and volume, so it
does not touch the normal local development database. Remove the containers and
test data with:

```bash
docker compose -f test-compose.yml down -v
```

### Google OAuth configuration

Create a **Web application** OAuth client in Google Cloud. Add:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

For production, add the same values with the final HTTPS origin, for example:

- `https://dreams.example.com`
- `https://dreams.example.com/api/auth/callback/google`

If the consent screen is in testing mode, add both journal users as test users. Put the client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`—never in source control.

## Environment variables

| Variable               | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string                       |
| `BETTER_AUTH_URL`      | Public app origin, with no trailing path           |
| `BETTER_AUTH_SECRET`   | Random secret of at least 32 characters            |
| `GOOGLE_CLIENT_ID`     | Google OAuth web client ID                         |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                         |
| `AUTH_ALLOWED_EMAILS`  | Two comma-separated Google email addresses         |
| `OPENAI_API_KEY`       | Server-side OpenAI API key                         |
| `OPENAI_IMAGE_MODEL`   | Optional model override; defaults to `gpt-image-2` |

Generate an auth secret with `openssl rand -base64 32`.

## Database changes

Edit [`src/db/schema.ts`](src/db/schema.ts), then generate and verify a migration:

```bash
pnpm run db:generate
pnpm run db:migrate
```

Commit both the schema change and the generated `drizzle/` files. Production applies committed migrations through the one-shot migrations image before the app starts.

## Validation

```bash
pnpm run check
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
```

The CI workflow runs the same checks. A separate workflow renders both Compose files to catch invalid stack changes.

## Dokploy deployment

Deployment intentionally mirrors the pattern in [`OwenCross289/ApesDb`](https://github.com/OwenCross289/ApesDb): pushes to `main` build immutable app and migration images in GHCR, connect the workflow runner to the private network with Tailscale, then call Dokploy's compose deploy API.

1. In Dokploy, create a Compose service from [`deploy-compose.yml`](deploy-compose.yml).
2. Route the app domain to the `app` service on port `3000`.
3. Configure these Dokploy Compose environment variables:

   - `POSTGRES_PASSWORD`
   - `BETTER_AUTH_URL`
   - `BETTER_AUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `AUTH_ALLOWED_EMAILS`
   - `OPENAI_API_KEY`
   - optionally `OPENAI_IMAGE_MODEL`

4. Configure these GitHub Actions repository secrets:

   - `TS_OAUTH_CLIENT_ID`
   - `TS_AUDIENCE`
   - `DOKPLOY_API_TOKEN`
   - `DOKPLOY_COMPOSE_ID`

5. Ensure Dokploy can pull `ghcr.io/owencross289/dreamcatcher/app:latest` and the matching `migrations` image. If the GHCR packages are not public, add registry credentials in Dokploy.

Until the Dokploy/Tailscale secrets exist, the deployment workflow still builds and publishes images but safely skips the redeploy call.

## Privacy notes

- The allowlist is enforced during Better Auth user creation and again on every journal/image request.
- The allowlist does not make a leaked database harmless. Back up and secure the Postgres volume as sensitive personal data.
- Images are stored as `bytea` inside PostgreSQL. This is deliberately simple for a two-person journal, but an encrypted private object store would scale better if the journal grows substantially.
- Dream text is sent to OpenAI only when creating or regenerating its illustration.
