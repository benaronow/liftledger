import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";

export const setTimerEnd = async ({
  reply,
  id,
  timerEnd,
}: {
  reply: FastifyReply;
  id: string;
  timerEnd: Date | string;
}) => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      { $set: { "timer.end": timerEnd } },
      { new: true },
    );
    if (!updatedUser) return reply.code(404).send({ error: "User not found" });
    return { timerEnd };
  } catch (error) {
    console.error("Failed to update timer end:", error);
    return reply.code(500).send({ error: "Failed to update timer end" });
  }
};
