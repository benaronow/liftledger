## Production image for @liftledger/api (Fastify + tsx).
## Build context is the monorepo root because the API imports the
## @liftledger/shared workspace package by source.
FROM node:24-slim AS base
WORKDIR /app

# --- deps layer -----------------------------------------------------------
# Copy only manifests first so `yarn install` is cached until a manifest or
# the lockfile changes. Every workspace package.json is required for Yarn to
# validate against the frozen lockfile.
COPY package.json yarn.lock ./
COPY apps/api/package.json        apps/api/package.json
COPY apps/web/package.json        apps/web/package.json
COPY apps/mobile/package.json     apps/mobile/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/api-client/package.json packages/api-client/package.json

# tsx is a devDependency but IS the runtime, so dev deps must be installed.
# --production=false forces that even though NODE_ENV is set at runtime (Yarn 1
# skips devDependencies when NODE_ENV=production, which would drop tsx).
# --ignore-scripts skips native/postinstall steps we don't need (e.g.
# mongodb-memory-server downloading a Mongo binary).
RUN yarn install --frozen-lockfile --ignore-scripts --production=false

# --- app layer ------------------------------------------------------------
COPY . .

# Runtime env. Set NODE_ENV here (not before install) so it doesn't cause
# Yarn to skip devDependencies. PORT must match internal_port in fly.toml.
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# `start` runs `tsx src/index.ts` and reads config from the environment
# (Fly secrets), not from .env.local.
CMD ["yarn", "workspace", "@liftledger/api", "start"]
