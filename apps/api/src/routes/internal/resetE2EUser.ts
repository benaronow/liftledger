import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import {
  DEFAULT_EXERCISE_NAMES,
  DEFAULT_EXERCISE_EQUIPMENT,
  DEFAULT_UNITS,
} from "@liftledger/shared";
import { env } from "../../env";

const LBS = "lbs";

// E2E teardown: wipe the dedicated regression-test user's workout data back to
// a clean, onboarded baseline so each Maestro run starts from a known state.
// Deliberately scoped to env.E2E_TEST_AUTH0_ID only — it can never touch any
// other account, which is what makes it safe to run against the prod DB. The
// user document itself (identity, timer presets) is preserved; only the
// programs they own and the data that references them are cleared.
export const resetE2EUser = async ({ reply }: { reply: FastifyReply }) => {
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
          "options.exerciseNames": [...DEFAULT_EXERCISE_NAMES],
          "options.equipment": [...DEFAULT_EXERCISE_EQUIPMENT],
          "options.units": [...DEFAULT_UNITS],
          "options.defaultUnit": LBS,
          "options.gyms": [],
          "timerSettings.exerciseOverrides": {},
        },
        $unset: { curProgram: "", "timerSettings.end": "" },
      },
    );

    return { ok: true, programsDeleted: deletedCount };
  } catch (error) {
    console.error("Failed to reset E2E test user:", error);
    return reply.code(500).send({ error: "Failed to reset E2E test user" });
  }
};
