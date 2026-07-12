import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import type { TimerSettings } from "@liftledger/shared";

// Fields a client may patch. `end` is deliberately excluded — it's owned by the
// timer/end routes.
const PATCHABLE_FIELDS = [
  "presets",
  "defaultEnabled",
  "defaultTime",
  "exerciseOverrides",
] as const;

export const updateTimerSettings = async ({
  reply,
  id,
  patch,
}: {
  reply: FastifyReply;
  id: string;
  patch?: Partial<TimerSettings>;
}) => {
  if (!patch || typeof patch !== "object")
    return reply.code(400).send({ error: "Invalid timer settings patch" });

  // Merge only the provided fields, addressed individually so a change to one
  // setting can't clobber a concurrent change to another.
  const $set = Object.fromEntries(
    PATCHABLE_FIELDS.filter((key) => patch[key] !== undefined).map((key) => [
      `timer.settings.${key}`,
      patch[key],
    ]),
  );

  if (Object.keys($set).length === 0)
    return reply.code(400).send({ error: "No valid timer settings to update" });

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      { $set },
      { new: true },
    ).populate([{ path: "programs", model: ProgramModel }]);
    if (!updatedUser) return reply.code(404).send({ error: "User not found" });
    return updatedUser;
  } catch (error) {
    console.error("Failed to update timer settings:", error);
    return reply.code(500).send({ error: "Failed to update timer settings" });
  }
};
