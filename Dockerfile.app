FROM node:26-bookworm-slim AS base
WORKDIR /app
RUN npm install --global pnpm@11.9.0

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM node:26-bookworm-slim AS final
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

COPY --from=build --chown=node:node /app/.output ./.output

USER node
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
