# @liftledger/web

LiftLedger web client — a single-page app (Vite + React 19 + React Router v7).
Consumes the shared `@liftledger/api-client` and `@liftledger/shared` packages;
auth is Auth0 via `@auth0/auth0-react`.

## Prerequisites

- Node + **yarn** (run `yarn install` from the repo root — this is a workspace).
- The local TLS cert pair at `certificates/localhost.pem` + `localhost-key.pem`
  (mkcert). Dev serves over **https://localhost:3000** so it matches the Auth0
  SPA app's Allowed Callback/Logout/Web-Origins and the API's `CORS_ORIGINS`.
- The API running (see `apps/api`) — the web app has no data without it.

## Environment

Create `.env.local` with the following. All vars are `VITE_*` (exposed to the
browser at build time):

| Var | Purpose |
|-----|---------|
| `VITE_AUTH0_DOMAIN` | Auth0 tenant domain (`auth.liftledger.app`) |
| `VITE_AUTH0_CLIENT_ID` | The Auth0 **SPA** application's client ID |
| `VITE_AUTH0_AUDIENCE` | API identifier (`https://api.liftledger.app`) |
| `VITE_API_URL` | API base URL (`https://localhost:4000` in dev) |

## Run

```bash
yarn web:dev        # https://localhost:3000   (from repo root)
# or, from this dir:
yarn dev
```

## Scripts

| Script | What it does |
|--------|--------------|
| `dev` | Vite dev server (HMR) on https://localhost:3000 |
| `build` | `tsc --noEmit` then `vite build` |
| `preview` | Serve the production build locally |
| `typecheck` | `tsc --noEmit` |
| `test` / `test:run` | Vitest (watch / once) |

## Notes

- The cross-platform data layer (`@liftledger/api-client`, `@liftledger/shared`)
  is shared with `apps/mobile`. Only the UI here is web-specific
  (Bootstrap, recharts, react-datepicker, etc.).
- `src/AppProviders.tsx` wires Auth0 + SWR + `initApiClient` — it's the web
  counterpart to mobile's `MobileAppProviders.tsx`.
