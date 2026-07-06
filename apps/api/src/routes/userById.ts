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
  "timerSettings",
  "gyms",
  "exerciseNames",
  "exerciseEquipment",
  "units",
  "defaultUnit",
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

  app.put<{
    Params: IdParams;
    Body: {
      field: "name" | "equipment" | "unit" | "gym";
      from: string;
      to: string;
      scope: "list" | "current" | "all";
    };
  }>(
    "/users/:id/renameExercise",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const { field, from, to, scope } = req.body ?? {};
      const trimmedTo = typeof to === "string" ? to.trim() : "";
      if (
        (field !== "name" &&
          field !== "equipment" &&
          field !== "unit" &&
          field !== "gym") ||
        !from ||
        !trimmedTo ||
        (scope !== "list" && scope !== "current" && scope !== "all")
      )
        return reply.code(400).send({ error: "Invalid rename request" });

      const listField = {
        name: "exerciseNames",
        equipment: "exerciseEquipment",
        unit: "units",
        gym: "gyms",
      }[field];
      const exerciseKey = field;

      try {
        const user = await UserModel.findOne({ _id: id });
        if (!user) return reply.code(404).send({ error: "User not found" });

        const list: string[] = user.get(listField) ?? [];
        const collides = list.some(
          (o) =>
            o.toLowerCase() !== from.toLowerCase() &&
            o.toLowerCase() === trimmedTo.toLowerCase(),
        );
        if (collides)
          return reply
            .code(409)
            .send({ error: `"${trimmedTo}" already exists` });

        const nextList = list.map((o) =>
          o.toLowerCase() === from.toLowerCase() ? trimmedTo : o,
        );
        user.set(listField, nextList);
        await user.save();

        if (scope !== "list") {
          const programIds =
            scope === "current"
              ? user.curProgram
                ? [String(user.curProgram)]
                : []
              : user.programs.map((p) => String(p));

          const programs = await ProgramModel.find({
            _id: { $in: programIds },
          });
          for (const program of programs) {
            let changed = false;
            for (const rotation of program.rotations) {
              for (const session of rotation) {
                // Gym also lives on the session itself, not just its exercises.
                if (field === "gym" && session.gym === from) {
                  session.gym = trimmedTo;
                  changed = true;
                }
                for (const exercise of session.exercises) {
                  if (exercise[exerciseKey] === from) {
                    exercise[exerciseKey] = trimmedTo;
                    changed = true;
                  }
                }
              }
            }
            if (field === "gym" && program.primaryGym === from) {
              program.primaryGym = trimmedTo;
              changed = true;
            }
            if (changed) {
              program.markModified("rotations");
              await program.save();
            }
          }
        }

        const updatedUser = await UserModel.findOne({ _id: id }).populate([
          { path: "programs", model: ProgramModel },
        ]);
        return updatedUser;
      } catch (error) {
        console.error("Failed to rename exercise:", error);
        return reply.code(500).send({ error: "Failed to rename exercise" });
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
          {
            $set: { curProgram: newProgram },
            $addToSet: { programs: newProgram },
          },
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
    "/users/:id/timerEnd",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      try {
        const user = await UserModel.findOne({ _id: id });
        if (!user) return reply.code(404).send({ error: "User not found" });
        return { timerEnd: user.timerSettings?.end };
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
          { $set: { "timerSettings.end": timerEnd } },
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
          { $unset: { "timerSettings.end": "" } },
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
