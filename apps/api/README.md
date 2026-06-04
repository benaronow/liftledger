# @liftledger/api

LiftLedger backend — Fastify + Mongoose, with Auth0 RS256 bearer-token auth
(JWKS verified via `get-jwks`). Serves both the web and mobile clients.

## Prerequisites

- Node + **yarn** (`yarn install` from the repo root).
- A MongoDB connection string (`MONGODB_URI`) — MongoDB Atlas in this project.
- For local HTTPS: the mkcert pair at `certificates/localhost.pem` +
  `localhost-key.pem`. Without `SSL_*` vars the server falls back to plain HTTP.

## Environment

Create `apps/api/.env.local` (gitignored; loaded via `tsx --env-file`).
**Required** unless noted:

| Var | Required | Purpose |
|-----|----------|---------|
| `MONGODB_URI` | ✓ | Mongo connection string |
| `AUTH0_AUDIENCE` | ✓ | API identifier; tokens must carry this `aud` |
| `AUTH0_ISSUER_BASE_URL` | ✓ | Token issuer (`https://auth.liftledger.app/`) |
| `PORT` | — | Listen port (default `4000`) |
| `AUTH0_DOMAIN` | — | Tenant domain; password-reset flow |
| `AUTH0_CLIENT_ID` | — | Client ID used for password-reset + verification emails (the **SPA** app) |
| `AUTH0_TENANT_DOMAIN` | — | Canonical tenant (`dev-….us.auth0.com`) for Management API calls |
| `AUTH0_MGMT_CLIENT_ID` / `AUTH0_MGMT_CLIENT_SECRET` | — | **M2M** app credentials for the Auth0 Management API (`/users/me` enrichment, email change, delete) |
| `CORS_ORIGINS` | — | Comma-separated allowed web origins |
| `SSL_CRT_FILE` / `SSL_KEY_FILE` | — | TLS cert/key paths; set both to serve HTTPS |

> ⚠️ `.env.local` holds live secrets (Mongo URI, M2M secret). It's gitignored —
> keep it that way. These are queued for rotation in the Phase 5 checklist.

## Run

```bash
yarn api:dev        # tsx watch on https://localhost:4000   (from repo root)
# or, from this dir:
yarn dev
```

## Scripts

| Script | What it does |
|--------|--------------|
| `dev` | `tsx watch` with live reload, loads `.env.local` |
| `start` | `tsx` once (no watch), loads `.env.local` |
| `build` | `tsc` → `dist/` |
| `typecheck` | `tsc --noEmit` |
| `test` / `test:run` | Vitest against `mongodb-memory-server` (watch / once) |

## Notes

- `src/build.ts` is the Fastify app factory (used by both `src/index.ts` and
  tests); `src/index.ts` connects Mongo, wires optional TLS, and listens.
- Auth: every protected route requires a valid RS256 bearer token. A subset of
  `/users/me` operations additionally call the Auth0 **Management API** using
  the M2M credentials — so those need `AUTH0_MGMT_*` + `AUTH0_TENANT_DOMAIN`.
- Models live in `@liftledger/shared/models` (server-only Mongoose schemas);
  the mobile/web clients never import that sub-path.
