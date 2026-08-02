import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import {
  DEFAULT_EXERCISE_NAMES,
  DEFAULT_EXERCISE_EQUIPMENT,
  DEFAULT_UNITS,
} from "@liftledger/shared";
import { env } from "../../env";

// Merge defaults with seed-specific extras, case-insensitively de-duped, so the
// E2E user's option lists match what a real (default-seeded) user would see.
const withDefaults = (defaults: string[], extras: string[]): string[] => {
  const seen = new Set(defaults.map((d) => d.toLowerCase()));
  return [...defaults, ...extras.filter((e) => !seen.has(e.toLowerCase()))];
};

// --- E2E seed data ---------------------------------------------------------
// Variant "test1" (the default): the Rotation-1 "Initial" program from the
// manual LiftLedger test doc (Test 1), used to put the regression user in a
// known starting state before the Maestro logging flow runs. A real program
// holds only the rotations created so far (one to start) with `length` as the
// target; the API's update route generates and appends each next rotation from
// the previous one as a rotation is completed. So we seed a SINGLE rotation and
// let the app produce rotations 2-5 via its own progression, exactly as the doc
// was produced.
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
  warmupSets: [],
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

// --- Variant "part2" -------------------------------------------------------
// Short program for programCompletionTest2: 2 rotations x 2 sessions, seeded
// WITH warmup sets so warmup logging/progression, dropsets, skip-day, and
// on-the-fly exercise edits can all be exercised without a 5-week run.
const seededExercise = ({
  name,
  equipment,
  gym,
  unit = LBS,
  warmups = [],
  workings,
  completed = false,
}: {
  name: string;
  equipment: string;
  gym: string;
  unit?: string;
  warmups?: [number, number][];
  workings: [number, number][];
  completed?: boolean;
}) => ({
  name,
  equipment,
  gym,
  unit,
  addedOn: false,
  warmupSets: warmups.map(([weight, reps]) => ({
    ...plannedSet(weight, reps),
    completed,
  })),
  workingSets: workings.map(([weight, reps]) => ({
    ...plannedSet(weight, reps),
    completed,
  })),
});

const buildPart2Program = () => ({
  name: "E2E Warmup Program",
  length: 2,
  primaryGym: GYM1,
  curRotationIdx: 0,
  curSessionIdx: 0,
  rotations: [
    [
      {
        name: "Push",
        gym: GYM1,
        completedDate: undefined,
        exercises: [
          seededExercise({
            name: "BB Bench",
            equipment: "Barbell",
            gym: GYM1,
            warmups: [
              [45, 10],
              [65, 5],
            ],
            workings: [
              [100, 8],
              [100, 8],
            ],
          }),
          seededExercise({
            name: "DB OHP",
            equipment: "Dumbbell",
            gym: GYM1,
            workings: [
              [40, 10],
              [40, 10],
            ],
          }),
        ],
      },
      {
        name: "Legs",
        gym: GYM1,
        completedDate: undefined,
        exercises: [
          seededExercise({
            name: "BB Squat",
            equipment: "Barbell",
            gym: GYM1,
            warmups: [[95, 5]],
            workings: [
              [185, 5],
              [185, 5],
            ],
          }),
          seededExercise({
            name: "Leg Extension",
            equipment: "Machine",
            gym: GYM1,
            workings: [[90, 12]],
          }),
        ],
      },
    ],
  ],
});

// --- Variant "options" -----------------------------------------------------
// Pre-populated state for the option-rename regression (optionUpdatesTest): one
// fully-completed historical program plus a current program mid-flight (first
// session done, second session current and untouched). Every rename scope then
// has something to prove against: "list" must leave both programs alone,
// "current" must rewrite the current program (including the NOT-yet-completed
// session — the original 3a bug) but not history, and "all" must rewrite both.
const GYM_ONE = "Gym One";
const GYM_TWO = "Gym Two";
const GYM_THREE = "Gym Three";
const KGS = "kgs";
const STONE = "stone";

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const buildOptionsHistoricalProgram = () => ({
  name: "Past Program",
  length: 1,
  primaryGym: GYM_ONE,
  curRotationIdx: 0,
  curSessionIdx: 1,
  rotations: [
    [
      {
        name: "Old Push",
        gym: GYM_ONE,
        completedDate: daysAgo(30),
        exercises: [
          seededExercise({
            name: "BB Bench",
            equipment: "Barbell",
            gym: GYM_ONE,
            workings: [
              [100, 8],
              [100, 8],
            ],
            completed: true,
          }),
          seededExercise({
            name: "DB Curl",
            equipment: "Dumbbell",
            gym: GYM_ONE,
            unit: KGS,
            workings: [[12, 10]],
            completed: true,
          }),
        ],
      },
      {
        name: "Old Legs",
        gym: GYM_THREE,
        completedDate: daysAgo(28),
        exercises: [
          seededExercise({
            name: "BB Squat",
            equipment: "Barbell",
            gym: GYM_THREE,
            unit: STONE,
            workings: [[10, 5]],
            completed: true,
          }),
          seededExercise({
            name: "Cable Row",
            equipment: "Cable",
            gym: GYM_THREE,
            workings: [[50, 10]],
            completed: true,
          }),
          seededExercise({
            name: "Leg Press",
            equipment: "Machine",
            gym: GYM_THREE,
            workings: [[200, 10]],
            completed: true,
          }),
        ],
      },
    ],
  ],
});

const buildOptionsCurrentProgram = () => ({
  name: "Current Program",
  length: 2,
  primaryGym: GYM_ONE,
  curRotationIdx: 0,
  curSessionIdx: 1,
  rotations: [
    [
      {
        name: "Done Day",
        gym: GYM_ONE,
        completedDate: daysAgo(2),
        exercises: [
          seededExercise({
            name: "BB Bench",
            equipment: "Barbell",
            gym: GYM_ONE,
            workings: [
              [105, 8],
              [105, 8],
            ],
            completed: true,
          }),
          seededExercise({
            name: "DB Curl",
            equipment: "Dumbbell",
            gym: GYM_ONE,
            unit: KGS,
            workings: [[14, 10]],
            completed: true,
          }),
        ],
      },
      {
        name: "Today",
        gym: GYM_TWO,
        completedDate: undefined,
        exercises: [
          seededExercise({
            name: "BB Squat",
            equipment: "Barbell",
            gym: GYM_TWO,
            unit: STONE,
            workings: [[11, 5]],
          }),
          seededExercise({
            name: "DB Curl",
            equipment: "Dumbbell",
            gym: GYM_TWO,
            unit: KGS,
            workings: [[15, 10]],
          }),
          seededExercise({
            name: "Leg Press",
            equipment: "Machine",
            gym: GYM_TWO,
            workings: [[60, 10]],
          }),
        ],
      },
    ],
  ],
});

type SeedVariant = "test1" | "part2" | "options";

interface VariantSeed {
  programs: () => object[];
  exerciseNameExtras: string[];
  equipmentExtras: string[];
  gyms: string[];
  // part2/options pause for minutes between set logs (edits, settings trips),
  // which would let the fullscreen "Timer finished" overlay hijack the flow —
  // so those variants disable the auto rest-timer.
  disableRestTimer?: boolean;
}

const VARIANTS: Record<SeedVariant, VariantSeed> = {
  test1: {
    programs: () => [buildTest1Program()],
    // Pre-populate the option lists the add-exercise selects read from, so
    // equipment like "Machine" are selectable (not custom-add). The defaults
    // are seeded too (matching a real user); these extras are the test-specific
    // abbreviations layered on top. "Adductors"/"Leg Raises"/"Crunch" are
    // intentionally omitted here — the test adds them as custom names,
    // mirroring the doc.
    exerciseNameExtras: [
      "BB Bench",
      "DB OHP",
      "Tricep Pushdown",
      "BB Row",
      "Lat Pulldown",
      "DB Bicep Curl",
      "BB Squat",
      "Hamstring Curl",
      "Calf Raise",
    ],
    equipmentExtras: ["Barbell", "Dumbbell", "Cable", "Machine"],
    gyms: [GYM1],
  },
  part2: {
    programs: () => [buildPart2Program()],
    exerciseNameExtras: ["BB Bench", "DB OHP", "BB Squat", "Leg Extension"],
    equipmentExtras: ["Barbell", "Dumbbell", "Machine"],
    gyms: [GYM1],
    disableRestTimer: true,
  },
  options: {
    // Historical first, current second — curProgram points at the LAST one.
    programs: () => [
      buildOptionsHistoricalProgram(),
      buildOptionsCurrentProgram(),
    ],
    exerciseNameExtras: [
      "BB Bench",
      "DB Curl",
      "BB Squat",
      "Cable Row",
      "Leg Press",
    ],
    equipmentExtras: ["Barbell", "Dumbbell", "Cable", "Machine"],
    gyms: [GYM_ONE, GYM_TWO, GYM_THREE],
    disableRestTimer: true,
  },
};

const isSeedVariant = (v: string): v is SeedVariant => v in VARIANTS;

// E2E setup: install the requested variant's program(s) for the regression user
// so each Maestro flow starts from a known state. Same secret + allowlist guard
// as reset; wipes the user's existing programs first so it's re-runnable.
export const seedProgram = async ({
  reply,
  variant = "test1",
}: {
  reply: FastifyReply;
  variant?: string;
}) => {
  if (!isSeedVariant(variant))
    return reply.code(400).send({ error: `Unknown seed variant "${variant}"` });

  try {
    const user = await UserModel.findOne({ auth0Id: env.E2E_TEST_AUTH0_ID });
    if (!user)
      return reply.code(404).send({ error: "E2E test user not found" });

    const oldIds = user.programs.map((p) => String(p));
    if (user.curProgram) oldIds.push(String(user.curProgram));
    await ProgramModel.deleteMany({ _id: { $in: oldIds } });

    const seed = VARIANTS[variant];
    const programs = [];
    for (const programSeed of seed.programs()) {
      programs.push(await ProgramModel.create(programSeed));
    }

    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          programs: programs.map((p) => p._id),
          curProgram: programs[programs.length - 1]._id,
          "options.exerciseNames": withDefaults(
            DEFAULT_EXERCISE_NAMES,
            seed.exerciseNameExtras,
          ),
          "options.equipment": withDefaults(
            DEFAULT_EXERCISE_EQUIPMENT,
            seed.equipmentExtras,
          ),
          "options.gyms": seed.gyms,
          // Units are reset to the defaults so a crashed earlier run's renames
          // (e.g. "lbs" -> "lb" in optionUpdatesTest) can't leak in.
          "options.units": [...DEFAULT_UNITS],
          "options.defaultUnit": LBS,
          ...(seed.disableRestTimer
            ? { "timer.settings.defaultEnabled": false }
            : {}),
        },
        $unset: { "timer.end": "" },
      },
    );

    return {
      ok: true,
      variant,
      programIds: programs.map((p) => String(p._id)),
    };
  } catch (error) {
    console.error("Failed to seed E2E test program:", error);
    return reply.code(500).send({ error: "Failed to seed E2E test program" });
  }
};
