import type { FastifyInstance } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import type { Program, Exercise, CompletedExercise } from "@liftledger/shared";
import { getCompletedSessionsInProgram } from "@liftledger/shared";
import { authorizeCaller } from "../auth";

type IdParams = { id: string };

const completedExerciseRoutes = async (app: FastifyInstance) => {
  app.get<{ Params: IdParams }>(
    "/users/:id/completedExercises",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      try {
        const user = await UserModel.findOne({ _id: id })
          .populate([{ path: "programs", model: ProgramModel }])
          .lean();
        if (!user) return reply.code(404).send({ error: "User not found" });

        const programs: Program[] =
          (user.programs as unknown as Program[]) || [];

        const curProgram = programs.find(
          (program) => String(program._id) === String(user.curProgram),
        );

        const previousCompletedExercises: CompletedExercise[] = programs
          .flatMap((program) => {
            if (program._id === curProgram?._id) {
              return getCompletedSessionsInProgram(program).flatMap((session) =>
                session.exercises.map((exercise) => ({
                  ...exercise,
                  completedDate: session.completedDate!,
                })),
              );
            }

            return program.rotations.flatMap((rotation) =>
              rotation.flatMap((session) =>
                session.exercises.map((exercise) => ({
                  ...exercise,
                  completedDate: session.completedDate!,
                })),
              ),
            );
          })
          .reverse();

        const currentCompletedExercises: Exercise[] = curProgram
          ? curProgram.rotations[curProgram.curRotationIdx][
              curProgram.curSessionIdx
            ].exercises
              .slice()
              .reverse()
          : [];

        return {
          current: currentCompletedExercises,
          previous: previousCompletedExercises,
        };
      } catch (error) {
        console.error("Failed to fetch completed exercises:", error);
        return reply
          .code(500)
          .send({ error: "Failed to fetch completed exercises" });
      }
    },
  );
};

export default completedExerciseRoutes;
