# Mobile E2E regression tests (Maestro)

End-to-end regression flows that drive the **real app** on a simulator against a
**local API**, using a single dedicated test user and cleaning up its data after
each run. Auth uses Auth0's password (resource-owner) grant, so no browser sheet
is automated.

## How it fits together

- The dev build shows an **"E2E Sign In"** button on the Welcome screen
  (`__DEV__` + `EXPO_PUBLIC_E2E_EMAIL` only — absent in release builds). It calls
  `loginWithPasswordRealm`, which is a real Auth0 login: the token it returns is
  verified normally by the API, so **the local API needs no auth changes**.
- All test data is owned by one account (`E2E_TEST_AUTH0_ID`).
- Teardown calls `POST /internal/e2e/reset`, which deletes only that user's
  programs and resets their doc to a clean, onboarded baseline. The endpoint
  **refuses to operate on any other account**, which is what makes it safe to
  run against the production database.

## One-time setup

### 1. Auth0 dashboard
See the parent task notes — Password grant enabled on the native app, a Default
Directory set to `Username-Password-Authentication`, and a dedicated test user
created. Grab that user's `user_id` (the `auth0|...` value) for `E2E_TEST_AUTH0_ID`.

### 2. API env (`apps/api`)
```
INTERNAL_API_SECRET=<some long random string>
E2E_TEST_AUTH0_ID=auth0|<the test user's id>
```
Both must be set or `/internal/e2e/reset` returns 503.

### 3. Mobile env (`apps/mobile/.env.local`, NOT committed)
```
EXPO_PUBLIC_API_URL=https://localhost:4000
EXPO_PUBLIC_E2E_EMAIL=e2e@liftledger.app
EXPO_PUBLIC_E2E_PASSWORD=<the test user's password>
```

### 4. Build the dev client once
```
yarn mobile:ios   # installs the dev build on the simulator
```
If the API uses the mkcert self-signed cert, trust it in the booted simulator:
```
xcrun simctl keychain booted add-root-cert <path-to-mkcert-rootCA.pem>
```

### 5. First login to onboard the test user
Launch the app once and tap **E2E Sign In**, then complete onboarding manually.
After that, `reset` keeps the account onboarded between runs.

## Running

Start the local API (`yarn api:start:local`) and boot the simulator, then run
via the `run.sh` wrapper (NOT `maestro test` directly — see TLS note below):

```
apps/mobile/.maestro/run.sh apps/mobile/.maestro/flows/smoke.yaml \
  -e INTERNAL_SECRET=<INTERNAL_API_SECRET>
```

`API_URL` / `INTERNAL_SECRET` are consumed by `scripts/reset.js` (host-side
teardown). `API_URL` defaults to `https://localhost:4000` in each flow's `env:`
block (override with `-e API_URL=...`); `INTERNAL_SECRET` is kept off-disk so it
must be passed on the CLI. Run the whole suite by pointing the wrapper at the
`flows/` dir.

### TLS: why `run.sh` instead of `maestro test`

The host-side `seed.js` / `reset.js` call the dev API at `https://localhost:4000`,
which uses the local **mkcert** cert. Maestro runs on the JVM, which has its own
trust store and won't trust mkcert by default (`PKIX path building failed`).
`run.sh` points the JVM at `truststore.jks` — a copy of the JDK's default CAs
plus the mkcert root — via `JAVA_TOOL_OPTIONS`. The store is machine-local and
gitignored. To (re)build it after an mkcert CA change:

```
cp "$(/usr/libexec/java_home)/lib/security/cacerts" apps/mobile/.maestro/truststore.jks
keytool -importcert -noprompt -trustcacerts -alias mkcert-root \
  -file "$HOME/Library/Application Support/mkcert/rootCA.pem" \
  -keystore apps/mobile/.maestro/truststore.jks -storepass changeit
```

(The simulator needs the same CA trusted separately — see step 4 above.)

## Manual cleanup

If a run dies mid-flight and leaves data behind (the `reset.yaml` subflow has no
`env:` default, so pass both vars):
```
maestro test apps/mobile/.maestro/subflows/reset.yaml \
  -e API_URL=https://localhost:4000 -e INTERNAL_SECRET=<secret>
```

## Regression flows (from LiftLedger Test.pdf)

`flows/test1.yaml` is the first real regression flow: it seeds the Test-1
Week-1 program (`POST /internal/e2e/seed-program`) and logs the "W1-A" actuals —
completing sets with edited weight/reps and skipping sets — across all three
days. It needs the same `-e` vars as reset (seed + teardown both use them):

```
maestro test apps/mobile/.maestro/flows/test1.yaml \
  -e INTERNAL_SECRET=<INTERNAL_API_SECRET>
```

`test1.yaml` is **cumulative** and grows week by week: it logs each week's
Actuals and asserts the app's carried-forward Initial values at the start of the
next week (the progression check). It currently covers **W1–W2**. It's built
from reusable, parameterized subflows:

- `subflows/logSet.yaml` (`SET`, `WEIGHT`, `REPS`) — complete a set (covers plain
  completes and doc "e" edits)
- `subflows/skipSet.yaml` (`SET`) — skip a set
- `subflows/addSet.yaml` (`WEIGHT`, `REPS`) — add an add-on set (the "+" after an
  exercise is fully complete)
- `subflows/addExercise.yaml` (`POS`, `NAME`, `EQUIPMENT`, `WEIGHT_TYPE`) — add an
  add-on exercise via FAB → Edit Exercises, inserted at position `POS`

Still to come: **gym switches** (W3+, FAB → Change Gym) need a `switchGym`
subflow, plus the W3–W5 driver sections.

### Selectors most likely to need a tweak on first run

W2 was authored without a simulator in the loop, so expect to adjust:
- `addExercise.yaml` is the least-validated — the three `SearchableSelect`
  modals (name custom-add, equipment/weight-type pick) and the insert-row
  targeting (`insert-exercise-<n>`) are the likeliest to need tuning.
- Progression assertions match the set-row text (`"10 reps"`, `"100lbs"`); if the
  rendered format differs, adjust those `assertVisible`s.

## Layout

- `flows/` — top-level flows (`basic.yaml` harness check, `test1.yaml`)
- `subflows/` — reusable pieces (`login`, `reset`, `logSet`, `skipSet`,
  `addSet`, `addExercise`)
- `scripts/` — host-side JS (`reset.js`, `seed.js`)
