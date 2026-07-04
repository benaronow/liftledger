// One-off prod migration for the user-level "weight type" -> "unit" rename:
//   user.weightTypes       -> user.units
//   user.defaultWeightType -> user.defaultUnit
//
// These are top-level fields on the `User` collection, so a plain `$rename`
// works. `$rename` on a missing source field is a no-op, which makes this
// idempotent and safe to re-run.
//
// Run:  yarn --cwd apps/api tsx --env-file=.env.local scripts/migrate-user-units.ts [--dry-run]
import { connectMongo, disconnectMongo } from "../src/db";
import { env } from "../src/env";

const main = async () => {
  const dryRun = process.argv.includes("--dry-run");
  await connectMongo(env.MONGODB_URI);
  const mongoose = (await import("mongoose")).default;
  const collection = mongoose.connection.collection("User");

  const filter = {
    $or: [
      { weightTypes: { $exists: true } },
      { defaultWeightType: { $exists: true } },
    ],
  };

  if (dryRun) {
    const count = await collection.countDocuments(filter);
    console.log(`[dry-run] Users needing migration: ${count}`);
  } else {
    const { modifiedCount } = await collection.updateMany(filter, {
      $rename: { weightTypes: "units", defaultWeightType: "defaultUnit" },
    });
    console.log(`Users migrated: ${modifiedCount}`);
  }

  await disconnectMongo();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
