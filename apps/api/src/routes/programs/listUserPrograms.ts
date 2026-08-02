import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import type { Program, ProgramSummary } from "@liftledger/shared";
import { toProgramSummary } from "@liftledger/shared";

export const listUserPrograms = async ({
  reply,
  id,
}: {
  reply: FastifyReply;
  id: string;
}) => {
  try {
    const user = await UserModel.findOne({ _id: id }).populate([
      { path: "programs", model: ProgramModel },
    ]);
    if (!user) return reply.code(404).send({ error: "User not found" });

    const programs = user.programs as unknown as Program[];
    const summaries: ProgramSummary[] = programs.map(toProgramSummary);
    return summaries;
  } catch (error) {
    console.error("Failed to list user programs:", error);
    return reply.code(500).send({ error: "Failed to list user programs" });
  }
};
