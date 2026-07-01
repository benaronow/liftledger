import type { FastifyInstance } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import type {
  Program,
  CompletedExercise,
  Exercise,
  User,
} from "@liftledger/shared";
import { getCompletedSessionsInProgram } from "@liftledger/shared";
import { authorizeCaller } from "../auth";

const UPDATABLE_FIELDS = [
  "timerPresets",
  "gyms",
  "customExerciseNames",
  "customExerciseEquipment",
] as const satisfies readonly (keyof User)[];

type UpdatableField = (typeof UPDATABLE_FIELDS)[number];

type IdParams = { id: string };

const userByIdRoutes = async (app: FastifyInstance) => {
  app.get<{ Params: IdParams }>(
    "/users/:id",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      try {
        const user = await UserModel.findOne({ _id: id });
        if (!user) return reply.code(404).send({ error: "User not found" });
        return user;
      } catch (error) {
        console.error("Failed to fetch user:", error);
        return reply.code(500).send({ error: "Failed to fetch user" });
      }
    },
  );

  app.put<{ Params: IdParams; Body: Partial<User> }>(
    "/users/:id",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const body = req.body ?? {};
      const update: Partial<Pick<User, UpdatableField>> = {};
      for (const field of UPDATABLE_FIELDS) {
        if (field in body) update[field] = body[field] as never;
      }

      try {
        const updatedUser = await UserModel.findOneAndUpdate(
          { _id: id },
          { $set: update },
          { new: true },
        ).populate([{ path: "programs", model: ProgramModel }]);
        if (!updatedUser)
          return reply.code(404).send({ error: "User not found" });
        return updatedUser;
      } catch (error) {
        console.error("Failed to update user:", error);
        return reply.code(500).send({ error: "Failed to update user" });
      }
    },
  );

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

        const programs: Program[] = (user.programs as unknown as Program[]) || [];

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
          ? curProgram.rotations[curProgram.curRotationIdx][curProgram.curSessionIdx].exercises
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

  app.post<{ Params: IdParams; Body: { program: Program } }>(
    "/users/:id/startProgram",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const { program } = req.body;

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
          { $set: { curProgram: newProgram }, $addToSet: { programs: newProgram } },
          { new: true },
        ).populate([{ path: "programs", model: ProgramModel }]);
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
    },
  );

  app.post<{ Params: IdParams }>(
    "/users/:id/quitProgram",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

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
    },
  );

  app.get<{ Params: IdParams }>(
    "/users/:id/timerPresets",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      try {
        const user = await UserModel.findOne({ _id: id });
        if (!user) return reply.code(404).send({ error: "User not found" });
        return { timerPresets: user.timerPresets };
      } catch (error) {
        console.error("Failed to fetch timer presets:", error);
        return reply.code(500).send({ error: "Failed to fetch timer presets" });
      }
    },
  );

  app.put<{ Params: IdParams; Body: User["timerPresets"] }>(
    "/users/:id/timerPresets",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const timerPresets = req.body;

      try {
        const updatedUser = await UserModel.findOneAndUpdate(
          { _id: id },
          { $set: { timerPresets } },
          { new: true },
        );
        if (!updatedUser)
          return reply.code(404).send({ error: "User not found" });
        return { timerPresets };
      } catch (error) {
        console.error("Failed to update timer presets:", error);
        return reply
          .code(500)
          .send({ error: "Failed to update timer presets" });
      }
    },
  );

  app.get<{ Params: IdParams }>(
    "/users/:id/timerEnd",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      try {
        const user = await UserModel.findOne({ _id: id });
        if (!user) return reply.code(404).send({ error: "User not found" });
        return { timerEnd: user.timerEnd };
      } catch (error) {
        console.error("Failed to fetch timer end:", error);
        return reply.code(500).send({ error: "Failed to fetch timer end" });
      }
    },
  );

  app.put<{ Params: IdParams; Body: Date | string }>(
    "/users/:id/timerEnd",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const timerEnd = req.body;

      try {
        const updatedUser = await UserModel.findOneAndUpdate(
          { _id: id },
          { $set: { timerEnd } },
          { new: true },
        );
        if (!updatedUser)
          return reply.code(404).send({ error: "User not found" });
        return { timerEnd };
      } catch (error) {
        console.error("Failed to update timer end:", error);
        return reply.code(500).send({ error: "Failed to update timer end" });
      }
    },
  );

  app.delete<{ Params: IdParams }>(
    "/users/:id/timerEnd",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      try {
        const updatedUser = await UserModel.findOneAndUpdate(
          { _id: id },
          { $unset: { timerEnd: null } },
          { new: true },
        );
        if (!updatedUser)
          return reply.code(404).send({ error: "User not found" });
        return { timerEnd: undefined };
      } catch (error) {
        console.error("Failed to clear timer end:", error);
        return reply.code(500).send({ error: "Failed to clear timer end" });
      }
    },
  );
};

export default userByIdRoutes;
