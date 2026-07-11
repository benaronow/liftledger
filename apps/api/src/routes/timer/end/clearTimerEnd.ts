import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";

export const clearTimerEnd = async ({
  reply,
  id,
}: {
  reply: FastifyReply;
  id: string;
}) => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      { $unset: { "timer.end": "" } },
      { new: true },
    );
    if (!updatedUser) return reply.code(404).send({ error: "User not found" });
    return { timerEnd: undefined };
  } catch (error) {
    console.error("Failed to clear timer end:", error);
    return reply.code(500).send({ error: "Failed to clear timer end" });
  }
};
