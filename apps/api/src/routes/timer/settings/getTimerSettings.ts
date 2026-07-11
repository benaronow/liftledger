import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";

export const getTimerSettings = async ({
  reply,
  id,
}: {
  reply: FastifyReply;
  id: string;
}) => {
  try {
    const user = await UserModel.findOne({ _id: id });
    if (!user) return reply.code(404).send({ error: "User not found" });
    return { timerSettings: user.timer?.settings };
  } catch (error) {
    console.error("Failed to fetch timer settings:", error);
    return reply.code(500).send({ error: "Failed to fetch timer settings" });
  }
};
