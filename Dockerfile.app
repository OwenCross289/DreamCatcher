FROM node:26-bookworm-slim AS dependencies
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-bookworm-slim AS build
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:26-bookworm-slim AS final
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

COPY --from=build --chown=node:node /app/.output ./.output

USER node
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
