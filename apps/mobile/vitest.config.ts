import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    env: {
      // Streak math depends on local midnights; pin a DST-observing zone so
      // the calendar-day and DST-transition tests are deterministic.
      TZ: "America/Chicago",
    },
  },
});
