// Setup: install a known program state for the E2E user via the guarded seed
// endpoint. Like reset.js this runs on the Maestro host and is scoped to the
// single E2E account, so it's safe to re-run. API_URL / INTERNAL_SECRET are
// injected via `maestro test -e ...` (see .maestro/README.md).
//
// The calling flow picks its fixture via SEED_VARIANT in its env block:
//   test1 (default) — the Test-1 doc program (programCompletionTest)
//   part2           — short warmup-enabled program (programCompletionTest2)
//   options         — historical + mid-flight programs (optionUpdatesTest)
const variant = typeof SEED_VARIANT !== "undefined" ? SEED_VARIANT : "test1";

const res = http.post(`${API_URL}/internal/e2e/seed-program`, {
  headers: {
    "x-internal-secret": INTERNAL_SECRET,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ variant: variant }),
});

if (!res.ok) {
  throw new Error(`E2E seed failed: HTTP ${res.status} ${res.body}`);
}
