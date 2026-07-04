// One-off prod migration for the exercise data-model rename:
//   exercise.sets       -> exercise.workingSets
//   exercise.weightType -> exercise.unit
//
// All exercise data lives in the `Program` collection under
// rotations[][].exercises[]. `$rename` can't reach fields nested inside arrays,
// so we read each document, transform it in JS, and write it back. Uses the
// native driver (not the Mongoose model) so it can read/write the *legacy*
// field names even though the schema has already been renamed.
//
// Idempotent: an exercise that already has `workingSets`/`unit` is left alone,
// so this is safe to re-run. Additive fields (warmupSets/dropSets) need no
// backfill — absent is a valid `undefined`.
//
// Run:  yarn --cwd apps/api tsx --env-file=.env.local scripts/migrate-exercise-fields.ts [--dry-run]
import { connectMongo, disconnectMongo } from "../src/db";
import { env } from "../src/env";

interface RawExercise {
  sets?: unknown;
  workingSets?: unknown;
  weightType?: unknown;
  unit?: unknown;
  [key: string]: unknown;
}
interface RawSession {
  exercises?: RawExercise[];
  [key: string]: unknown;
}
interface RawProgram {
  _id: unknown;
  rotations?: RawSession[][];
}

// Returns true if the exercise was mutated in place.
const migrateExercise = (exercise: RawExercise): boolean => {
  let changed = false;

  if ("sets" in exercise && !("workingSets" in exercise)) {
    exercise.workingSets = exercise.sets;
    delete exercise.sets;
    changed = true;
  }
  if ("weightType" in exercise && !("unit" in exercise)) {
    exercise.unit = exercise.weightType;
    delete exercise.weightType;
    changed = true;
  }

  return changed;
};

const main = async () => {
  const dryRun = process.argv.includes("--dry-run");
  await connectMongo(env.MONGODB_URI);
  const mongoose = (await import("mongoose")).default;
  const collection = mongoose.connection.collection<RawProgram>("Program");

  let programsScanned = 0;
  let programsChanged = 0;
  let exercisesChanged = 0;

  const cursor = collection.find({});
  for await (const program of cursor) {
    programsScanned++;
    let programChanged = false;

    for (const rotation of program.rotations ?? []) {
      for (const session of rotation) {
        for (const exercise of session.exercises ?? []) {
          if (migrateExercise(exercise)) {
            exercisesChanged++;
            programChanged = true;
          }
        }
      }
    }

    if (programChanged) {
      programsChanged++;
      if (!dryRun) {
        await collection.replaceOne({ _id: program._id }, program);
      }
    }
  }

  await disconnectMongo();

  console.log(
    `${dryRun ? "[dry-run] " : ""}Programs scanned: ${programsScanned}, ` +
      `programs changed: ${programsChanged}, exercises migrated: ${exercisesChanged}`,
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
