# Mobile E2E regression tests (Maestro)

End-to-end regression flows that drive the **real app** on a simulator against a
**local API**, using a single dedicated test user and cleaning up its data after
each run. Auth uses Auth0's password (resource-owner) grant, so no browser sheet
is automated.

## How it fits together

- The dev build shows an **"E2E Sign In"** button on the Welcome screen when
  launched in E2E mode (`__DEV__` + `EXPO_PUBLIC_E2E=1`, set by the `start:e2e` /
  `ios:e2e` scripts — absent in release builds and in a normal `yarn mobile:ios`
  launch). It calls
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
yarn mobile:ios:e2e   # installs the E2E dev build (EXPO_PUBLIC_E2E=1) on the simulator
```
The `:e2e` variant is what surfaces the **E2E Sign In** button; a plain
`yarn mobile:ios` build won't show it. Once the dev client is installed, later
runs only need Metro in E2E mode — `yarn workspace @liftledger/mobile start:e2e`
(no native rebuild).
If the API uses the mkcert self-signed cert, trust it in the booted simulator:
```
xcrun simctl keychain booted add-root-cert <path-to-mkcert-rootCA.pem>
```

### 5. First login to onboard the test user
Only needed for the **prod-DB** path (`yarn api:start:local`) — the in-memory
path (`yarn api:start:e2e`, see Running) seeds this user automatically. Launch
the app once and tap **E2E Sign In**, then complete onboarding manually. After
that, `reset` keeps the account onboarded between runs.

## Running

### 1. Start the API

Prefer the **in-memory** API for the E2E suite — it's dramatically faster:

```
yarn api:start:e2e
```

Each set submission blocks the app UI on a program write plus a
completed-exercises refetch; against the remote Atlas DB that's two internet
round-trips per set (~30 sets), which dominates the run. `api:start:e2e` boots a
throwaway `mongodb-memory-server` instead (see `apps/api/scripts/start-e2e.ts`),
dropping each to sub-millisecond. It reuses everything else from `.env.local`
(Auth0, TLS, `INTERNAL_API_SECRET`, `E2E_TEST_AUTH0_ID`) and serves the same
`https://localhost:4000` with the same mkcert cert, so the flows and host-side
scripts need no changes.

Tradeoffs of the in-memory path:
- The DB is **ephemeral** — recreated on every boot, so it never touches the
  prod database. The launcher seeds the dedicated E2E user itself, so the
  manual onboarding in setup step 5 is **not** needed here.
- Login still uses real Auth0; the token is resolved against the locally-seeded
  user by `auth0Id`.

To instead run against the **prod** Atlas DB (the original behavior — requires
the onboarded test user from step 5), use `yarn api:start:local`.

### 2. Run the flow

Boot the simulator, then run via the yarn wrapper (which points Maestro at the
mkcert trust store — see the TLS note below):

```
yarn mobile:e2e:program-completion -e INTERNAL_SECRET=<INTERNAL_API_SECRET>
```

That resolves to the `run.sh` wrapper (NOT `maestro test` directly). To run a
different flow or the whole suite, call the wrapper directly:

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

## Regression flows

There are four regression flows, each with a yarn wrapper (all need the same
`-e INTERNAL_SECRET=...`; setup/teardown scripts use it):

| flow | yarn script | seed variant |
| --- | --- | --- |
| `programCompletionTest.yaml` | `mobile:e2e:program-completion` | `test1` (default) |
| `programCompletionTest2.yaml` | `mobile:e2e:program-completion-2` | `part2` |
| `programCreationTest.yaml` | `mobile:e2e:program-creation` | none (reset only) |
| `optionUpdatesTest.yaml` | `mobile:e2e:option-updates` | `options` |

The seed variant is chosen via `SEED_VARIANT` in each flow's `env:` block and
passed by `scripts/seed.js` to `POST /internal/e2e/seed-program`:

- `test1` — the Test-1 doc program (5 rotations x 3 sessions, no warmups).
- `part2` — 2 rotations x 2 sessions seeded WITH warmup sets; also disables the
  auto rest-timer for the run (the flow pauses minutes between set logs, which
  would otherwise trigger the fullscreen "Timer finished" overlay).
- `options` — a completed historical program plus a current program mid-flight
  (session 1 done, session 2 current/untouched), for the option-rename scopes.
  Also disables the auto rest-timer.
- `showcase` — NOT a regression fixture. Two programs for App Store screenshots:
  a current 6-rotation Push/Pull/Legs program (warm amber streak flame,
  mid-program ring, fresh session for Complete Day) plus an archived
  "Hypertrophy Block" that logs a branded machine across 3 gyms so the Progress
  chart shows three contiguous, upward-stepping chunks. The archived program is
  dated with a gap so it feeds the chart without touching the streak. See
  "Screenshots" below.

`reset` restores the rest-timer default, so variants can't leak between runs.

## Screenshots

To capture App Store screenshots against the rich `showcase` state, skip Maestro
entirely and boot the in-memory API pre-seeded with it:

```
yarn api:start:e2e:screenshots   # = api:start:e2e with E2E_SEED_VARIANT=showcase
yarn mobile:ios:e2e              # app in E2E mode, points at localhost:4000
```

Launch the app, tap **E2E Sign In**, and it lands on the seeded showcase. Grab
Dashboard (Home), Progress (chart — pick an exercise), Program, and Complete Day
("Start Workout"). Restart the API to reset to a clean showcase state.

(`flows/screenshots.yaml` does the same seed via the internal endpoint if you'd
rather drive it through Maestro against a persistent DB — e.g. `api:start:local`
on the prod Atlas — but the in-memory path above needs no secret and no seed step.)

### programCompletionTest (from LiftLedger Test.pdf)

Seeds the Test-1 Week-1 program and logs the "W1-A" actuals — completing sets
with edited weight/reps and skipping sets — across all three days:

```
maestro test apps/mobile/.maestro/flows/programCompletionTest.yaml \
  -e INTERNAL_SECRET=<INTERNAL_API_SECRET>
```

`programCompletionTest.yaml` is **cumulative** and grows week by week: it logs each week's
Actuals and asserts the app's carried-forward Initial values at the start of the
next week (the progression check). It covers the **full W1–W5** program through
program completion. It's built from reusable, parameterized subflows:

- `subflows/logSet.yaml` (`SET`, `WEIGHT`, `REPS`) — complete a set (covers plain
  completes and doc "e" edits)
- `subflows/skipSet.yaml` (`SET`) — skip a set
- `subflows/addSet.yaml` (`WEIGHT`, `REPS`) — add an add-on set (the "+" after an
  exercise is fully complete)
- `subflows/addExercise.yaml` (`POS`, `NAME`, `EQUIPMENT`, `UNIT`) — add an
  add-on exercise via FAB → Edit Exercises, inserted at position `POS`
- `subflows/switchGym.yaml` (`GYM`) — switch the session's gym via FAB → Change
  Gym (W3+); must run before any set is logged. Adds the gym as a custom option
  the first time and picks the existing option afterwards.

Two intentional deviations from the PDF (the doc is inconsistent with actual app
behavior — both are called out in the flow's header comment):
1. W5-I DB Bicep Curl set 2 is asserted as **30x12** (the app carries the W4-A
   actual), not the doc's 25x12.
2. The doc's add-on **"Skip"** sets are omitted — the app disables Skip for a
   freshly-added set, and add-on sets never carry forward.

### programCompletionTest2

Session-screen behaviors the Test-1 flow does not touch, on the short `part2`
program: warmup logging and add-on warmups (including on an exercise with
none), dropsets (mirrored complete on submit, stripped on carry-forward),
"Previous note" surfacing, the Skip Day button (mid-session and untouched —
the latter also finishing the program), on-the-fly exercise edits via FAB →
Edit Exercises (equipment change → blank sets, change back → repopulated from
history, unit change → sets kept), add-on exercise delete, and a history
spot-check of the note/dropset in the Progress program detail.

### programCreationTest

Drives Create Program from a clean account: every validation error up front
and clearing as fixed, Save FAB gating, custom gym add, the unsaved-changes
leave guard, session editing (warmup + working set fields, zero-set error),
session duplicate/delete/add, saving (dashboard flips to Workout, workout
screen shows the authored sets), and quitting (dashboard back to Create
program; the program archived to Progress history).

### optionUpdatesTest

All 12 cases of {Exercises, Equipment, Gyms, Units} x {Just the list / This
program too / All history too} against the `options` fixture, with distinct
rename targets per scope so each has a witness: list-scope must leave both
programs alone, current-scope must rewrite the current program INCLUDING the
not-yet-completed session (the original stale-cache bug) but not history, and
all-scope must rewrite both. Logs one set after the name renames to prove a
subsequent program save doesn't revert them (the stale-PUT half of that bug).
Also covers the duplicate-name rename error and list-only option deletion.

### Selector lessons (learned the hard way — apply to new flows)

- **Coalesced labels**: any `Pressable`/button container merges its child text
  into ONE label joined by ", " and ending with icon glyphs — set chips
  ("Warmup, 45lbs, ✕, 10 reps"), AccordionRows ("Rotation 1, 2/2 sessions
  completed, 󰅀"), ProgramView exercise rows ("BB Bench, Barbell, 󰅀"). Match
  with `.*value.*`, or `"Title, Subtitle, .*"` when exactness matters (e.g.
  distinguishing "Dumbbell" from "Dumbbells").
- **Header back button**: `headerBackButtonDisplayMode: "minimal"` labels the
  chevron with the PREVIOUS screen's title — tap `"Home"`, not `"Back"`. (The
  Progress detail's back FAB really is labeled "Back".)
- **Input values** are standalone text elements (AppTextInput renders the value
  as a Text overlay when unfocused) — exact matches work there.
- **Number pad**: it covers the bottom of the screen, has no dismiss key, and
  Maestro will happily "tap" an element at stale, keyboard-shifted coordinates.
  Dismiss by tapping a nearby non-input label (dialog title, "Warmup sets"),
  then `scrollUntilVisible` before tapping anything below the fold.
- **Autocorrect** mangles typed text in any input that doesn't disable it
  (type-and-verify loops then spin forever) — app inputs that E2E types into
  set `autoCorrect={false}` (Searchbar, rename dialog).
- **LogBox** toasts cover the tab bar in dev and swallow its taps — E2E mode
  silences them (`LogBox.ignoreAllLogs()` in App.tsx).
- **iOS system alerts** (e.g. "Apple Account Verification") can interrupt long
  runs and block every tap; sign the simulator out of the Apple Account, or
  dismiss manually and re-run.
- Progression assertions match the set-row text (`"10 reps"`, `"100lbs"`); if
  the rendered format differs, adjust those `assertVisible`s.

## Layout

- `flows/` — top-level flows (`basic.yaml` harness check,
  `programCompletionTest.yaml`, `programCompletionTest2.yaml`,
  `programCreationTest.yaml`, `optionUpdatesTest.yaml`)
- `subflows/` — reusable pieces (`login`, `reset`, `logSet`, `logWarmupSet`,
  `logSetDrops`, `skipSet`, `addSet`, `addWarmupSet`, `addExercise`,
  `editExercise`, `switchGym`, `renameOption`)
- `scripts/` — host-side JS (`reset.js`, `seed.js` — variant via `SEED_VARIANT`)
