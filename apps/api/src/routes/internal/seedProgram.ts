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

// --- Variant "showcase" ----------------------------------------------------
// NOT a regression flow — a rich, aspirational state for App Store screenshots.
// Two programs are seeded:
//
//   1. Current "Push Pull Legs" — 6 rotations in at one gym, lifts climbing
//      steadily. Drives the Dashboard (warm amber streak flame, mid-program
//      ring), the Program tab, and a fresh 7th-rotation session for Complete
//      Day. Sessions are dated on consecutive days ending yesterday: getStreak
//      charges each rotation-boundary gap to the entered rotation's rest
//      allowance, so any spacing > 1 day accrues boundary + internal rest days
//      past restDays and resets the streak. Consecutive days charge zero rest,
//      keeping all 18 days unbroken and the streak alive today (2 days grace).
//      6 rotations x 3 sessions = 18 workout days -> streak 18 -> STREAK_HEAT
//      tier 1 (orange -> gold -> cream -> blue -> purple by tiers of 10): warm
//      gold/amber core #FFD767 with an orange base #FFAA00, high in the tier so
//      the flame renders tall.
//
//   2. Archived "Hypertrophy Block" — the Progress chart aggregates completed
//      exercises across ALL programs, so this past program carries the multi-gym
//      story without touching the current streak. It logs one exercise (Chest
//      Press on the Hammer Strength Chest Press Machine) whose gym stays fixed
//      for a stretch at a time, so the chart groups it into three contiguous
//      chunks (one per gym) — each with its own shape and its own point count —
//      that step upward overall. It's dated to end 25 days ago; the >restDays
//      gap to the current
//      program keeps these 9 days out of the streak — they only feed the chart.
const SHOWCASE_GYMS = ["Gold's Gym", "Equinox", "LA Fitness"];

const roundTo5 = (n: number) => Math.round(n / 5) * 5;

// --- Current program (PPL) --------------------------------------------------
interface ShowcaseExercise {
  name: string;
  equipment: string;
  base: number;
  inc: number;
  reps: number;
  warmup?: boolean;
}

// Increments are multiples of 0.5 so every logged weight stays a clean .0/.5,
// and bases/incs are tuned so 6 rotations of climbing land at believable
// working weights.
const SHOWCASE_TEMPLATE: { name: string; exercises: ShowcaseExercise[] }[] = [
  {
    name: "Push",
    exercises: [
      { name: "BB Bench", equipment: "Barbell", base: 135, inc: 2.5, reps: 8, warmup: true },
      { name: "DB Shoulder Press", equipment: "Dumbbell", base: 45, inc: 1, reps: 10 },
      { name: "Tricep Pushdown", equipment: "Cable", base: 40, inc: 1.5, reps: 12 },
    ],
  },
  {
    name: "Pull",
    exercises: [
      { name: "BB Row", equipment: "Barbell", base: 135, inc: 2.5, reps: 8 },
      { name: "Lat Pulldown", equipment: "Cable", base: 120, inc: 2, reps: 10 },
      { name: "DB Bicep Curl", equipment: "Dumbbell", base: 25, inc: 0.5, reps: 12 },
    ],
  },
  {
    name: "Legs",
    exercises: [
      { name: "BB Squat", equipment: "Barbell", base: 185, inc: 5, reps: 6, warmup: true },
      { name: "Leg Press", equipment: "Machine", base: 270, inc: 5, reps: 10 },
      { name: "Calf Raise", equipment: "Machine", base: 150, inc: 2.5, reps: 15 },
    ],
  },
];

const SHOWCASE_COMPLETED_ROTATIONS = 6; // rotations 0-5 done; rotation 6 in progress
const SHOWCASE_PROGRAM_LENGTH = 8;
const SHOWCASE_SESSIONS_PER_ROTATION = SHOWCASE_TEMPLATE.length;
const SHOWCASE_COMPLETED_SESSIONS =
  SHOWCASE_COMPLETED_ROTATIONS * SHOWCASE_SESSIONS_PER_ROTATION;
const SHOWCASE_GYM = SHOWCASE_GYMS[0];

const buildShowcaseCurrentProgram = () => {
  const rotations = Array.from(
    { length: SHOWCASE_COMPLETED_ROTATIONS + 1 },
    (_, r) => {
      const completed = r < SHOWCASE_COMPLETED_ROTATIONS;
      return SHOWCASE_TEMPLATE.map((sessionTpl, s) => {
        const globalIdx = r * SHOWCASE_SESSIONS_PER_ROTATION + s;
        // Newest completed session (globalIdx = COMPLETED-1) lands yesterday;
        // each earlier one steps back exactly 1 day (consecutive, see above).
        const daysBack = SHOWCASE_COMPLETED_SESSIONS - globalIdx;
        return {
          name: sessionTpl.name,
          gym: SHOWCASE_GYM,
          completedDate: completed ? daysAgo(daysBack) : undefined,
          exercises: sessionTpl.exercises.map((ex) => {
            const weight = ex.base + ex.inc * r;
            return seededExercise({
              name: ex.name,
              equipment: ex.equipment,
              gym: SHOWCASE_GYM,
              warmups: ex.warmup
                ? [
                    [roundTo5(weight * 0.5), 10],
                    [roundTo5(weight * 0.75), 5],
                  ]
                : [],
              workings: [
                [weight, ex.reps],
                [weight, ex.reps],
              ],
              completed,
            });
          }),
        };
      });
    },
  );

  return {
    name: "Push Pull Legs",
    length: SHOWCASE_PROGRAM_LENGTH,
    primaryGym: SHOWCASE_GYM,
    curRotationIdx: SHOWCASE_COMPLETED_ROTATIONS,
    curSessionIdx: 0,
    restDays: 2,
    rotations,
  };
};

// --- Archived program (branded machine, 3 gym chunks) -----------------------
const SHOWCASE_MACHINE = {
  name: "Chest Press",
  equipment: "Hammer Strength Chest Press Machine",
  reps: 10,
};
const SHOWCASE_ACCESSORY = { name: "Cable Fly", equipment: "Cable", reps: 15 };

// Each gym's chunk has a distinct shape AND a distinct length, so the chart
// reads as three individual blocks — not one motif shifted upward — that still
// step upward overall. Weights are multiples of 5.
const SHOWCASE_MACHINE_CHUNKS: { gym: string; weights: number[] }[] = [
  { gym: SHOWCASE_GYMS[0], weights: [85, 95, 105, 110] }, // steady climb (4 pts)
  { gym: SHOWCASE_GYMS[1], weights: [115, 110, 125] }, // dip then jump (3 pts)
  { gym: SHOWCASE_GYMS[2], weights: [130, 145, 135, 150, 155] }, // wave to a peak (5 pts)
];

// Flatten chunks into one rotation-per-entry list, tagging each with its gym.
const SHOWCASE_ARCHIVED_LOG = SHOWCASE_MACHINE_CHUNKS.flatMap((chunk) =>
  chunk.weights.map((weight) => ({ gym: chunk.gym, weight })),
);
// Newest archived day sits 25 days ago — comfortably past the current program's
// oldest day (18 ago), so the >restDays gap keeps these out of the streak.
const SHOWCASE_ARCHIVED_END_DAYS_AGO = 25;

const buildShowcaseArchivedProgram = () => {
  const total = SHOWCASE_ARCHIVED_LOG.length;
  const rotations = SHOWCASE_ARCHIVED_LOG.map(({ gym, weight }, g) => {
    const machineWork: [number, number] = [weight, SHOWCASE_MACHINE.reps];
    // Accessory climbs monotonically by global index — its own shape, distinct
    // from the machine's per-chunk wobble.
    const accessoryWork: [number, number] = [
      30 + 2.5 * g,
      SHOWCASE_ACCESSORY.reps,
    ];
    return [
      {
        name: "Machine Day",
        gym,
        completedDate: daysAgo(SHOWCASE_ARCHIVED_END_DAYS_AGO + (total - 1 - g)),
        exercises: [
          seededExercise({
            name: SHOWCASE_MACHINE.name,
            equipment: SHOWCASE_MACHINE.equipment,
            gym,
            workings: [machineWork, machineWork],
            completed: true,
          }),
          seededExercise({
            name: SHOWCASE_ACCESSORY.name,
            equipment: SHOWCASE_ACCESSORY.equipment,
            gym,
            workings: [accessoryWork, accessoryWork],
            completed: true,
          }),
        ],
      },
    ];
  });

  return {
    name: "Hypertrophy Block",
    length: total,
    primaryGym: SHOWCASE_GYM,
    curRotationIdx: total - 1,
    curSessionIdx: 1,
    restDays: 2,
    rotations,
  };
};

type SeedVariant = "test1" | "part2" | "options" | "showcase";

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
  showcase: {
    // Archived first, current last — applySeedVariant points curProgram at the
    // final program, so the PPL program stays current and Hypertrophy Block sits
    // in Progress history feeding the chart.
    programs: () => [
      buildShowcaseArchivedProgram(),
      buildShowcaseCurrentProgram(),
    ],
    exerciseNameExtras: [
      ...SHOWCASE_TEMPLATE.flatMap((s) => s.exercises.map((e) => e.name)),
      SHOWCASE_MACHINE.name,
      SHOWCASE_ACCESSORY.name,
    ],
    equipmentExtras: [
      "Barbell",
      "Dumbbell",
      "Cable",
      "Machine",
      SHOWCASE_MACHINE.equipment,
    ],
    gyms: [...SHOWCASE_GYMS],
    // No auto rest-timer overlay hijacking the screen mid-screenshot.
    disableRestTimer: true,
  },
};

export const isSeedVariant = (v: string): v is SeedVariant => v in VARIANTS;

// Thrown when the guarded E2E account doesn't exist yet — the route maps it to a
// 404, the boot seeder (start-e2e) lets it surface as a startup failure.
export class E2EUserNotFoundError extends Error {}

// Install a variant's program(s) for the E2E user and reset their option lists
// to that variant's expectations. Wipes the user's existing programs first so
// it's re-runnable. Shared by the internal seed route and the in-memory boot
// seeder (start-e2e). Throws E2EUserNotFoundError if the account is missing.
export const applySeedVariant = async (
  variant: SeedVariant,
): Promise<string[]> => {
  const user = await UserModel.findOne({ auth0Id: env.E2E_TEST_AUTH0_ID });
  if (!user) throw new E2EUserNotFoundError("E2E test user not found");

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

  return programs.map((p) => String(p._id));
};

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
    const programIds = await applySeedVariant(variant);
    return { ok: true, variant, programIds };
  } catch (error) {
    if (error instanceof E2EUserNotFoundError)
      return reply.code(404).send({ error: "E2E test user not found" });
    console.error("Failed to seed E2E test program:", error);
    return reply.code(500).send({ error: "Failed to seed E2E test program" });
  }
};
