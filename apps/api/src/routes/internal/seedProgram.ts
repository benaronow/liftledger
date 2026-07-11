import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import {
  DEFAULT_EXERCISE_NAMES,
  DEFAULT_EXERCISE_EQUIPMENT,
} from "@liftledger/shared";
import { env } from "../../env";

// Merge defaults with seed-specific extras, case-insensitively de-duped, so the
// E2E user's option lists match what a real (default-seeded) user would see.
const withDefaults = (defaults: string[], extras: string[]): string[] => {
  const seen = new Set(defaults.map((d) => d.toLowerCase()));
  return [...defaults, ...extras.filter((e) => !seen.has(e.toLowerCase()))];
};

// --- E2E seed data ---------------------------------------------------------
// The Rotation-1 "Initial" program from the manual LiftLedger test doc (Test 1),
// used to put the regression user in a known starting state before the Maestro
// logging flow runs. A real program holds only the rotations created so far (one to
// start) with `length` as the target; the API's update route generates and
// appends each next rotation from the previous one as a rotation is completed. So we
// seed a SINGLE rotation and let the app produce rotations 2-5 via its own progression,
// exactly as the doc was produced.
const LBS = "lbs";
const GYM1 = "Gym 1";
const TEST1_PROGRAM_LENGTH = 5;

const plannedSet = (weight: number, reps: number) => ({
  reps,
  weight,
  note: "",
  completed: false,
  skipped: false,
  addedOn: false,
});

const plannedExercise = (
  name: string,
  equipment: string,
  weight: number,
  reps: number,
) => ({
  name,
  equipment,
  gym: GYM1,
  unit: LBS,
  addedOn: false,
  workingSets: [plannedSet(weight, reps), plannedSet(weight, reps)],
});

const test1Week = () => [
  {
    name: "Session 1",
    gym: GYM1,
    completedDate: undefined,
    exercises: [
      plannedExercise("BB Bench", "Barbell", 100, 8),
      plannedExercise("DB OHP", "Dumbbell", 45, 8),
      plannedExercise("Tricep Pushdown", "Cable", 30, 12),
    ],
  },
  {
    name: "Session 2",
    gym: GYM1,
    completedDate: undefined,
    exercises: [
      plannedExercise("BB Row", "Barbell", 200, 10),
      plannedExercise("Lat Pulldown", "Cable", 150, 10),
      plannedExercise("DB Bicep Curl", "Dumbbell", 30, 12),
    ],
  },
  {
    name: "Session 3",
    gym: GYM1,
    completedDate: undefined,
    exercises: [
      plannedExercise("BB Squat", "Barbell", 300, 6),
      plannedExercise("Hamstring Curl", "Machine", 175, 14),
      plannedExercise("Calf Raise", "Machine", 350, 14),
    ],
  },
];

const buildTest1Program = () => ({
  name: "E2E Test Program",
  length: TEST1_PROGRAM_LENGTH,
  primaryGym: GYM1,
  curRotationIdx: 0,
  curSessionIdx: 0,
  // Only rotation 1 exists at seed time; the API appends rotations 2-5 as each completes.
  rotations: [test1Week()],
});

// E2E setup: install the Test-1 Rotation-1 program for the regression user so the
// Maestro logging flow starts from a known program. Same secret + allowlist
// guard as reset; wipes the user's existing programs first so it's re-runnable.
export const seedProgram = async ({ reply }: { reply: FastifyReply }) => {
  try {
    const user = await UserModel.findOne({ auth0Id: env.E2E_TEST_AUTH0_ID });
    if (!user)
      return reply.code(404).send({ error: "E2E test user not found" });

    const oldIds = user.programs.map((p) => String(p));
    if (user.curProgram) oldIds.push(String(user.curProgram));
    await ProgramModel.deleteMany({ _id: { $in: oldIds } });

    const program = await ProgramModel.create(buildTest1Program());

    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          programs: [program._id],
          curProgram: program._id,
          // Pre-populate the option lists the add-exercise selects read from,
          // so equipment like "Machine" are selectable (not custom-add). The
          // defaults are seeded too (matching a real user); these extras are the
          // test-specific abbreviations layered on top.
          // "Adductors"/"Leg Raises"/"Crunch" are intentionally omitted here —
          // the test adds them as custom names, mirroring the doc.
          "options.exerciseNames": withDefaults(DEFAULT_EXERCISE_NAMES, [
            "BB Bench",
            "DB OHP",
            "Tricep Pushdown",
            "BB Row",
            "Lat Pulldown",
            "DB Bicep Curl",
            "BB Squat",
            "Hamstring Curl",
            "Calf Raise",
          ]),
          "options.equipment": withDefaults(DEFAULT_EXERCISE_EQUIPMENT, [
            "Barbell",
            "Dumbbell",
            "Cable",
            "Machine",
          ]),
          "options.gyms": [GYM1],
        },
        $unset: { "timerSettings.end": "" },
      },
    );

    return { ok: true, programId: String(program._id) };
  } catch (error) {
    console.error("Failed to seed E2E test program:", error);
    return reply.code(500).send({ error: "Failed to seed E2E test program" });
  }
};
