# @liftledger/mobile

LiftLedger mobile client — Expo (SDK 56) + React Native, React Navigation,
auth via `react-native-auth0`. Consumes the same `@liftledger/api-client` and
`@liftledger/shared` packages as the web app; only the UI is platform-specific.

## ⚠️ This needs a native dev build, not Expo Go

`react-native-auth0` ships custom native code, so **Expo Go cannot run this app**.
You build a dev client onto a simulator/device with `expo run:ios`. First build
runs `expo prebuild` (generates the gitignored `ios/`/`android/` folders) and
installs CocoaPods, so it takes a few minutes; later runs are fast.

## Prerequisites

- Node + **yarn** (`yarn install` from the repo root).
- **Xcode** + command-line tools + a simulator, and **CocoaPods**
  (`brew install cocoapods`). (Android: Android Studio + an emulator.)
- The API running (see `apps/api`) — the dashboard has no data without it.

## Environment

Create `.env.local` with the following. All vars are `EXPO_PUBLIC_*` (inlined
into the bundle at build time):

| Var | Purpose |
|-----|---------|
| `EXPO_PUBLIC_AUTH0_DOMAIN` | Auth0 tenant domain (`auth.liftledger.app`) |
| `EXPO_PUBLIC_AUTH0_CLIENT_ID` | The Auth0 **Native** application's client ID |
| `EXPO_PUBLIC_AUTH0_AUDIENCE` | API identifier (`https://api.liftledger.app`) |
| `EXPO_PUBLIC_API_URL` | API base URL (`https://localhost:4000` in dev) |

### Auth0 setup (one-time)

The mobile app needs its **own Auth0 _Native_ application** — *not* the web SPA
client. Domain + audience are shared with web (same tenant + API). In that
Native app's settings add these **Allowed Callback URLs** and **Allowed Logout
URLs** (react-native-auth0 hardcodes the `.auth0` scheme suffix at runtime):

```
app.liftledger.mobile.auth0://auth.liftledger.app/ios/app.liftledger.mobile/callback
app.liftledger.mobile.auth0://auth.liftledger.app/android/app.liftledger.mobile/callback
```

## Run

```bash
yarn api:dev        # start the API first (separate terminal)
yarn mobile:ios     # prebuild + pods + build + boot simulator   (from repo root)
# or, from this dir:
yarn ios
```

### Local HTTPS API → trust the mkcert CA on the simulator

The dev API serves `https://localhost:4000` with a self-signed mkcert cert.
iOS rejects it by default, surfacing as `Axios Error: Network Error` on the
dashboard. Install the mkcert root CA into the **booted** simulator once:

```bash
xcrun simctl keychain booted add-root-cert \
  "$HOME/Library/Application Support/mkcert/rootCA.pem"
```

Then fully relaunch the app (the trust store is read at launch, not on JS
reload). **This resets if you erase the simulator** — re-run the command.

> Physical device: it can't see `localhost`. Point `EXPO_PUBLIC_API_URL` at your
> Mac's LAN IP and install/trust the mkcert CA on the device.

## Scripts

| Script | What it does |
|--------|--------------|
| `start` | `expo start --dev-client` (Metro for an installed dev build) |
| `ios` | `expo run:ios` — build + run on iOS simulator |
| `android` | `expo run:android` — build + run on Android emulator |
| `typecheck` | `tsc --noEmit` |

## Architecture

- `src/providers/MobileAppProviders.tsx` is the cross-platform **seam**: Auth0
  provider + `SWRConfig` + `initApiClient`. It mirrors web's `AppProviders.tsx`;
  the only difference is `getToken` pulls the access token from
  react-native-auth0's `getCredentials()` instead of web's `getAccessTokenSilently()`.
- Everything downstream — every `@liftledger/api-client` hook, every derived
  value — is unchanged from web.
- `app.config.ts` is the dynamic Expo config (identifiers, scheme, Auth0 plugin),
  pulling Auth0 values from `EXPO_PUBLIC_*` env.
