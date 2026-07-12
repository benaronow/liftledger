import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";

export const quitProgram = async ({
  reply,
  id,
}: {
  reply: FastifyReply;
  id: string;
}) => {
  const user = await UserModel.findOne({ _id: id });
  if (!user) return reply.code(404).send({ error: "User not found" });

  const program = await ProgramModel.findOne({ _id: user.curProgram });
  if (!program)
    return reply
      .code(400)
      .send({ error: "User does not have a current program" });

  const rotations = program.rotations.slice(0, program.curRotationIdx + 1);
  const endDate = new Date();

  try {
    await ProgramModel.findOneAndUpdate(
      { _id: user.curProgram },
      { $set: { rotations, endDate } },
    );
  } catch (error) {
    return reply
      .code(500)
      .send({ error: `Failed to update program: ${error}` });
  }

  const revertProgram = async () => {
    try {
      await ProgramModel.findOneAndUpdate(
        { _id: user.curProgram },
        { $set: { rotations: program.rotations }, $unset: { endDate: "" } },
      );
    } catch (revertErr) {
      console.error(
        "Failed to revert program update after user update failure:",
        revertErr,
      );
    }
  };

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      { $unset: { curProgram: "" } },
      { new: true },
    ).populate([{ path: "programs", model: ProgramModel }]);
    if (!updatedUser) {
      await revertProgram();
      return reply.code(404).send({ error: "User not found" });
    }
    return updatedUser;
  } catch (error) {
    await revertProgram();
    return reply
      .code(500)
      .send({ error: `Failed to update user: ${error}` });
  }
};
