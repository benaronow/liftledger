/**
 * One-off migration: rename the Program fields that changed when "week" became
 * "rotation" and "day" became "session".
 *
 *   weeks       -> rotations
 *   curWeekIdx  -> curRotationIdx
 *   curDayIdx   -> curSessionIdx
 *
 * The day/session objects live inside the (renamed) rotations array and have no
 * field names of their own that changed, so a single top-level $rename does it.
 *
 * Run against the same DB the API uses (MONGODB_URI from .env.local):
 *   cd apps/api && tsx --env-file=.env.local scripts/migrate-rename-rotations.ts
 *
 * Dry run (counts only, no writes):
 *   cd apps/api && tsx --env-file=.env.local scripts/migrate-rename-rotations.ts --dry
 *
 * Reverse it (if you need to roll back):
 *   ...scripts/migrate-rename-rotations.ts --reverse
 */
import mongoose from "mongoose";

const DRY = process.argv.includes("--dry");
const REVERSE = process.argv.includes("--reverse");

const FORWARD = { weeks: "rotations", curWeekIdx: "curRotationIdx", curDayIdx: "curSessionIdx" };
const BACKWARD = { rotations: "weeks", curRotationIdx: "curWeekIdx", curSessionIdx: "curDayIdx" };
const renameMap = REVERSE ? BACKWARD : FORWARD;
const oldField = Object.keys(renameMap)[0]; // "weeks" (or "rotations" in reverse)

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Run with: tsx --env-file=.env.local ...");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database handle on the mongoose connection.");
  const programs = db.collection("Program");

  const before = await programs.countDocuments({ [oldField]: { $exists: true } });
  console.log(`${REVERSE ? "REVERSE " : ""}migration: ${before} Program doc(s) still have "${oldField}"`);

  if (DRY) {
    console.log("--dry: no changes written.");
  } else if (before === 0) {
    console.log("Nothing to migrate (already done).");
  } else {
    const res = await programs.updateMany({}, { $rename: renameMap });
    console.log(`Renamed fields on ${res.modifiedCount} document(s).`);
    const leftover = await programs.countDocuments({ [oldField]: { $exists: true } });
    console.log(
      leftover === 0
        ? `Verified: no documents still have "${oldField}".`
        : `WARNING: ${leftover} document(s) still have "${oldField}".`,
    );
  }

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
