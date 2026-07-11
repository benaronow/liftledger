import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";

export const getUser = async ({
  reply,
  id,
}: {
  reply: FastifyReply;
  id: string;
}) => {
  try {
    const user = await UserModel.findOne({ _id: id });
    if (!user) return reply.code(404).send({ error: "User not found" });
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return reply.code(500).send({ error: "Failed to fetch user" });
  }
};
