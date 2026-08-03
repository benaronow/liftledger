// Start the API against a throwaway in-memory MongoDB for the Maestro E2E
// suite, instead of remote Atlas. Each set submission in the app blocks the UI
// on a program write + a completed-exercises refetch; against Atlas that's two
// internet round-trips per set (~30 sets), which dominates the run. A local
// in-memory Mongo drops each to sub-millisecond.
//
// The DB is ephemeral (recreated every boot), so we seed the dedicated E2E user
// here — otherwise /internal/e2e/{reset,seed-program} 404 (they look the user
// up by auth0Id and refuse to create it). Everything else (Auth0 verification,
// TLS, the internal secret) comes from .env.local, loaded via `tsx --env-file`.
import { MongoMemoryServer } from "mongodb-memory-server";

const main = async () => {
  const mem = await MongoMemoryServer.create();
  // Override the Atlas URI from .env.local. Set before importing anything that
  // reads env so the lazy env getter resolves to the local instance.
  process.env.MONGODB_URI = mem.getUri();

  const mongoose = (await import("mongoose")).default;
  const { connectMongo } = await import("../src/db");
  const { build } = await import("../src/build");
  const { env } = await import("../src/env");
  const UserModel = (await import("@liftledger/shared/models/user")).default;

  await connectMongo(env.MONGODB_URI);

  if (!env.E2E_TEST_AUTH0_ID)
    throw new Error("E2E_TEST_AUTH0_ID must be set (see .env.local)");

  // Onboarded baseline: identity + required fields only. Matches the "clean,
  // onboarded" shape /internal/e2e/reset restores (no programs, default option
  // lists). The reset/seed endpoints take over from here.
  await UserModel.updateOne(
    { auth0Id: env.E2E_TEST_AUTH0_ID },
    {
      $setOnInsert: {
        email: "e2e@liftledger.app",
        username: "e2e",
        fullName: "E2E Test User",
        timer: { settings: { presets: {} } },
        "options.gyms": [],
        programs: [],
      },
    },
    { upsert: true },
  );

  const https =
    env.SSL_CRT_FILE && env.SSL_KEY_FILE
      ? { keyPath: env.SSL_KEY_FILE, certPath: env.SSL_CRT_FILE }
      : undefined;

  // Optionally pre-install a seed variant so the in-memory DB comes up already
  // populated — used by `api:start:e2e:screenshots` to boot straight into the
  // "showcase" state for App Store captures, no Maestro seed step needed. The
  // regression suite leaves this unset and each flow seeds/resets its own state.
  const seedVariant = process.env.E2E_SEED_VARIANT;
  if (seedVariant) {
    const { applySeedVariant, isSeedVariant } = await import(
      "../src/routes/internal/seedProgram"
    );
    if (!isSeedVariant(seedVariant))
      throw new Error(`Unknown E2E_SEED_VARIANT "${seedVariant}"`);
    await applySeedVariant(seedVariant);
    console.log(`Seeded E2E user with "${seedVariant}" variant`);
  }

  const app = await build({ logger: true, https });
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  console.log(`E2E API on :${env.PORT} — in-memory Mongo at ${mem.getUri()}`);

  const shutdown = async () => {
    await app.close();
    await mongoose.disconnect();
    await mem.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
