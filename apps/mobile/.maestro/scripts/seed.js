// Setup: install the Test-1 Week-1 program for the E2E user via the guarded
// seed endpoint. Like reset.js this runs on the Maestro host and is scoped to
// the single E2E account, so it's safe to re-run. API_URL / INTERNAL_SECRET
// are injected via `maestro test -e ...` (see .maestro/README.md).
const res = http.post(`${API_URL}/internal/e2e/seed-program`, {
  headers: {
    "x-internal-secret": INTERNAL_SECRET,
    "Content-Type": "application/json",
  },
  // Maestro's http.post requires a body even when the endpoint ignores it.
  body: "{}",
});

if (!res.ok) {
  throw new Error(`E2E seed failed: HTTP ${res.status} ${res.body}`);
}
