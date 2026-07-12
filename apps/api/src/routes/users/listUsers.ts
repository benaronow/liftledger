import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";

export const listUsers = async ({ reply }: { reply: FastifyReply }) => {
  try {
    const users = await UserModel.find();
    return users;
  } catch (error) {
    console.error("Failed to list users:", error);
    return reply.code(500).send({ error: "Failed to list users" });
  }
};
