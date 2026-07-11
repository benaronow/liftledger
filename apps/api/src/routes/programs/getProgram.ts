import type { FastifyReply } from "fastify";
import ProgramModel from "@liftledger/shared/models/program";

export const getProgram = async ({
  reply,
  programId,
}: {
  reply: FastifyReply;
  programId: string;
}) => {
  try {
    const program = await ProgramModel.findOne({ _id: programId });
    if (!program) return reply.code(404).send({ error: "Program not found" });
    return program;
  } catch (error) {
    console.error("Failed to fetch program:", error);
    return reply.code(500).send({ error: "Failed to fetch program" });
  }
};
