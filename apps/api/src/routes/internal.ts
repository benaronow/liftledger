import { timingSafeEqual } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import { env } from "../env";

// Constant-time comparison that also avoids leaking length via early return.
const secretMatches = (provided: string, expected: string): boolean => {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
};

const isAuthorized = (req: FastifyRequest): boolean => {
  const expected = env.INTERNAL_API_SECRET;
  if (!expected) return false;
  const provided = req.headers["x-internal-secret"];
  return typeof provided === "string" && secretMatches(provided, expected);
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
  apparatus: string,
  weight: number,
  reps: number,
) => ({
  name,
  apparatus,
  gym: GYM1,
  weightType: LBS,
  addedOn: false,
  sets: [plannedSet(weight, reps), plannedSet(weight, reps)],
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
  startDate: new Date(),
  length: TEST1_PROGRAM_LENGTH,
  primaryGym: GYM1,
  curRotationIdx: 0,
  curSessionIdx: 0,
  // Only rotation 1 exists at seed time; the API appends rotations 2-5 as each completes.
  rotations: [test1Week()],
});

// Routes consumed by trusted server-to-server callers (e.g. Auth0 actions),
// not by end users. Authenticated with a shared secret header rather than a JWT.
const internalRoutes = async (app: FastifyInstance) => {
  // Username uniqueness gate for the Auth0 PreUserRegistration action. MongoDB
  // is the single source of truth for usernames, so the action asks us rather
  // than relying on Auth0's eventually-consistent user search.
  app.get("/internal/username-available", async (req, reply) => {
    if (!env.INTERNAL_API_SECRET)
      return reply.code(503).send({ error: "Internal API not configured" });
    if (!isAuthorized(req))
      return reply.code(401).send({ error: "Unauthorized" });

    const { username } = (req.query ?? {}) as { username?: unknown };
    const trimmed = typeof username === "string" ? username.trim() : undefined;
    if (!trimmed)
      return reply.code(400).send({ error: "Invalid username" });

    try {
      const taken = await UserModel.exists({ username: trimmed });
      return { available: !taken };
    } catch (error) {
      console.error("Failed to check username availability:", error);
      return reply.code(500).send({ error: "Failed to check username" });
    }
  });

  // E2E teardown: wipe the dedicated regression-test user's workout data back to
  // a clean, onboarded baseline so each Maestro run starts from a known state.
  // Deliberately scoped to env.E2E_TEST_AUTH0_ID only — it can never touch any
  // other account, which is what makes it safe to run against the prod DB. The
  // user document itself (identity, timer presets) is preserved; only the
  // programs they own and the data that references them are cleared.
  app.post("/internal/e2e/reset", async (req, reply) => {
    if (!env.INTERNAL_API_SECRET || !env.E2E_TEST_AUTH0_ID)
      return reply.code(503).send({ error: "E2E reset not configured" });
    if (!isAuthorized(req))
      return reply.code(401).send({ error: "Unauthorized" });

    try {
      const user = await UserModel.findOne({
        auth0Id: env.E2E_TEST_AUTH0_ID,
      });
      if (!user)
        return reply.code(404).send({ error: "E2E test user not found" });

      // Union of programs + curProgram so an orphaned current program (one not
      // present in the programs array) is still removed. The refs are stored
      // (unpopulated) as ObjectIds; String() yields the hex id Mongoose recasts.
      const programIds = user.programs.map((p) => String(p));
      if (user.curProgram) programIds.push(String(user.curProgram));

      const { deletedCount } = await ProgramModel.deleteMany({
        _id: { $in: programIds },
      });

      await UserModel.updateOne(
        { _id: user._id },
        {
          $set: {
            programs: [],
            customExerciseNames: [],
            customExerciseApparatuses: [],
            gyms: [],
          },
          $unset: { curProgram: "", timerEnd: "" },
        },
      );

      return { ok: true, programsDeleted: deletedCount };
    } catch (error) {
      console.error("Failed to reset E2E test user:", error);
      return reply.code(500).send({ error: "Failed to reset E2E test user" });
    }
  });

  // E2E setup: install the Test-1 Rotation-1 program for the regression user so the
  // Maestro logging flow starts from a known program. Same secret + allowlist
  // guard as reset; wipes the user's existing programs first so it's re-runnable.
  app.post("/internal/e2e/seed-program", async (req, reply) => {
    if (!env.INTERNAL_API_SECRET || !env.E2E_TEST_AUTH0_ID)
      return reply.code(503).send({ error: "E2E seed not configured" });
    if (!isAuthorized(req))
      return reply.code(401).send({ error: "Unauthorized" });

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
            // so apparatuses like "Machine" are selectable (not custom-add).
            // "Adductors"/"Leg Raises"/"Crunch" are intentionally omitted — the
            // test adds them as custom names, mirroring the doc.
            customExerciseNames: [
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
            customExerciseApparatuses: ["Barbell", "Dumbbell", "Cable", "Machine"],
            gyms: [GYM1],
          },
          $unset: { timerEnd: "" },
        },
      );

      return { ok: true, programId: String(program._id) };
    } catch (error) {
      console.error("Failed to seed E2E test program:", error);
      return reply.code(500).send({ error: "Failed to seed E2E test program" });
    }
  });
};

export default internalRoutes;
