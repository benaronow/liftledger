import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import type { Program } from "@liftledger/shared";

export const createProgram = async ({
  reply,
  id,
  program,
}: {
  reply: FastifyReply;
  id: string;
  program: Program;
}) => {
  let newProgram;
  try {
    newProgram = await ProgramModel.create(program);
  } catch (error) {
    console.error("Failed to create program:", error);
    return reply.code(500).send({ error: "Failed to create program" });
  }

  const deleteOrphanedProgram = async () => {
    try {
      await ProgramModel.findOneAndDelete({ _id: newProgram._id });
    } catch (revertErr) {
      console.error(
        "Failed to delete orphaned program after user update failure:",
        revertErr,
      );
    }
  };

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        $set: { curProgram: newProgram },
        $addToSet: { programs: newProgram },
      },
      { new: true },
    );
    if (!updatedUser) {
      await deleteOrphanedProgram();
      return reply.code(404).send({ error: "User not found" });
    }
    return updatedUser;
  } catch (error) {
    await deleteOrphanedProgram();
    console.error("Failed to start program:", error);
    return reply.code(500).send({ error: "Failed to start program" });
  }
};
