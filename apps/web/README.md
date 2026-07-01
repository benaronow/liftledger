# @liftledger/web

LiftLedger's public marketing site (Vite + React 19 + React Router v7), served
at `liftledger.app`. Two routes:

- `/` — marketing landing page
- `/privacy` — privacy policy (the URL referenced from App Store Connect)

The dependencies from the old in-browser app (`@liftledger/api-client`,
`@liftledger/shared`, `@auth0/auth0-react`, recharts, swr, etc.) are kept in
`package.json` for planned data-viewing features, but nothing in `src/` uses
them yet.

## Prerequisites

- Node + **yarn** (run `yarn install` from the repo root — this is a workspace).
- The local TLS cert pair at `certificates/localhost.pem` + `localhost-key.pem`
  (mkcert). Dev serves over **https://localhost:3000**.

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

## Before submitting to the App Store

Set `EFFECTIVE_DATE` and `CONTACT_EMAIL` in `src/Privacy/Privacy.tsx`, and
deploy so `/privacy` is live and publicly reachable (no auth).
