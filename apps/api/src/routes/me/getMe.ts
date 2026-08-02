import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import type { AuthedUser } from "../../auth";

export const getMe = async ({
  reply,
  me,
}: {
  reply: FastifyReply;
  me: AuthedUser;
}) => {
  try {
    const user = await UserModel.findOne({ _id: me._id });
    if (!user) return reply.code(404).send({ error: "User not found" });

    return user;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return reply.code(500).send({ error: "Failed to fetch current user" });
  }
};
