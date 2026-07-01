/**
 * One-off migration: rename the persisted "apparatus" field to "equipment" when
 * the domain term was renamed.
 *
 *   User.customExerciseApparatuses            -> customExerciseEquipment
 *   Program.rotations[][].exercises[].apparatus -> equipment
 *
 * The User field is top-level, so a plain $rename does it. The Program field is
 * nested inside rotations (an array of arrays) -> exercises (an array), which
 * $rename can't reach, so it's rewritten with a nested $map aggregation pipeline:
 * each exercise object is rebuilt with the old key filtered out (objectToArray ->
 * $filter -> arrayToObject) and the value merged back under the new key. Only
 * exercises that still carry the old field are touched ($cond), so the pipeline
 * is idempotent — a re-run leaves already-migrated exercises alone.
 *
 * Note: `rotations` is an array of arrays, which a dot-path $exists query cannot
 * traverse, so Program docs are counted with a flattening aggregation rather than
 * countDocuments (a dot-path count returns a false 0 here).
 *
 * Run against the same DB the API uses (MONGODB_URI from .env.local):
 *   cd apps/api && tsx --env-file=.env.local scripts/migrate-rename-apparatus.ts
 *
 * Dry run (counts only, no writes):
 *   cd apps/api && tsx --env-file=.env.local scripts/migrate-rename-apparatus.ts --dry
 *
 * Reverse it (if you need to roll back):
 *   ...scripts/migrate-rename-apparatus.ts --reverse
 */
import mongoose from "mongoose";

const DRY = process.argv.includes("--dry");
const REVERSE = process.argv.includes("--reverse");

// Field names, keyed by direction.
const USER_OLD = REVERSE ? "customExerciseEquipment" : "customExerciseApparatuses";
const USER_NEW = REVERSE ? "customExerciseApparatuses" : "customExerciseEquipment";
const EX_OLD = REVERSE ? "equipment" : "apparatus";
const EX_NEW = REVERSE ? "apparatus" : "equipment";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Run with: tsx --env-file=.env.local ...");
  process.exit(1);
}

// Rewrite every exercise's `EX_OLD` field to `EX_NEW`, walking the
// rotations[][].exercises[] nesting. The exercise object is rebuilt with the old
// key filtered out (objectToArray -> $filter -> arrayToObject) and its value
// merged back under the new key. (A $mergeObjects with `EX_OLD: "$$REMOVE"` does
// NOT work here — $mergeObjects skips missing values rather than deleting the
// existing key.) The $cond leaves exercises that no longer have `EX_OLD`
// untouched, so a re-run won't blank out an already-migrated `EX_NEW`.
const programPipeline = [
  {
    $set: {
      rotations: {
        $map: {
          input: "$rotations",
          as: "rot",
          in: {
            $map: {
              input: "$$rot",
              as: "sess",
              in: {
                $mergeObjects: [
                  "$$sess",
                  {
                    exercises: {
                      $map: {
                        input: "$$sess.exercises",
                        as: "ex",
                        in: {
                          $cond: [
                            { $ne: [{ $type: `$$ex.${EX_OLD}` }, "missing"] },
                            {
                              $mergeObjects: [
                                {
                                  $arrayToObject: {
                                    $filter: {
                                      input: { $objectToArray: "$$ex" },
                                      as: "kv",
                                      cond: { $ne: ["$$kv.k", EX_OLD] },
                                    },
                                  },
                                },
                                { [EX_NEW]: `$$ex.${EX_OLD}` },
                              ],
                            },
                            "$$ex",
                          ],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
];

// Count Program docs having at least one exercise whose `field` still exists.
// Flattens the rotations array-of-arrays first, since a dot-path $exists query
// cannot traverse that nesting (it silently matches nothing).
const countProgramsWithExerciseField = async (
  programs: import("mongodb").Collection,
  field: string,
): Promise<number> => {
  const res = await programs
    .aggregate([
      {
        $project: {
          exs: {
            $reduce: {
              input: "$rotations",
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  {
                    $reduce: {
                      input: "$$this",
                      initialValue: [],
                      in: {
                        $concatArrays: [
                          "$$value",
                          { $ifNull: ["$$this.exercises", []] },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $anyElementTrue: {
              $map: {
                input: "$exs",
                as: "e",
                in: { $ne: [{ $type: `$$e.${field}` }, "missing"] },
              },
            },
          },
        },
      },
      { $count: "n" },
    ])
    .toArray();
  return res[0]?.n ?? 0;
};

const run = async () => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database handle on the mongoose connection.");
  const users = db.collection("User");
  const programs = db.collection("Program");

  const usersBefore = await users.countDocuments({ [USER_OLD]: { $exists: true } });
  const programsBefore = await countProgramsWithExerciseField(programs, EX_OLD);
  console.log(`${REVERSE ? "REVERSE " : ""}migration:`);
  console.log(`  ${usersBefore} User doc(s) still have "${USER_OLD}"`);
  console.log(`  ${programsBefore} Program doc(s) still have exercise "${EX_OLD}"`);

  if (DRY) {
    console.log("--dry: no changes written.");
    await mongoose.disconnect();
    return;
  }

  if (usersBefore > 0) {
    const res = await users.updateMany({}, { $rename: { [USER_OLD]: USER_NEW } });
    console.log(`Renamed User.${USER_OLD} on ${res.modifiedCount} document(s).`);
  } else {
    console.log(`No User docs to migrate (already done).`);
  }

  if (programsBefore > 0) {
    const res = await programs.updateMany({}, programPipeline);
    console.log(`Rewrote exercise "${EX_OLD}" on ${res.modifiedCount} Program document(s).`);
  } else {
    console.log(`No Program docs to migrate (already done).`);
  }

  const usersLeft = await users.countDocuments({ [USER_OLD]: { $exists: true } });
  const programsLeft = await countProgramsWithExerciseField(programs, EX_OLD);
  console.log(
    usersLeft === 0 && programsLeft === 0
      ? `Verified: no documents still have the old "${EX_OLD}" field.`
      : `WARNING: ${usersLeft} User + ${programsLeft} Program doc(s) still have the old field.`,
  );

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
