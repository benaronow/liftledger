import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";

export const usernameAvailable = async ({
  reply,
  username,
}: {
  reply: FastifyReply;
  username?: unknown;
}) => {
  const trimmed = typeof username === "string" ? username.trim() : undefined;
  if (!trimmed) return reply.code(400).send({ error: "Invalid username" });

  try {
    const taken = await UserModel.exists({ username: trimmed });
    return { available: !taken };
  } catch (error) {
    console.error("Failed to check username availability:", error);
    return reply.code(500).send({ error: "Failed to check username" });
  }
};
