// Teardown: wipe the E2E test user's workout data via the API's guarded
// reset endpoint. Runs on the Maestro host (not the device), so it talks to
// the API directly. API_URL and INTERNAL_SECRET are injected via `maestro
// test -e API_URL=... -e INTERNAL_SECRET=...` (see .maestro/README.md).
//
// Kept idempotent and safe: the endpoint itself only ever touches the single
// account named by E2E_TEST_AUTH0_ID, so re-running this can't affect anyone.
const res = http.post(`${API_URL}/internal/e2e/reset`, {
  headers: {
    "x-internal-secret": INTERNAL_SECRET,
    "Content-Type": "application/json",
  },
  // Maestro's http.post requires a body even when the endpoint ignores it.
  body: "{}",
});

if (!res.ok) {
  throw new Error(`E2E reset failed: HTTP ${res.status} ${res.body}`);
}
