import type { FastifyInstance } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import BlockModel from "@liftledger/shared/models/block";
import type {
  Block,
  CompletedExercise,
  Exercise,
  User,
} from "@liftledger/shared";
import { getCompletedDaysInBlock } from "@liftledger/shared";
import { authorizeCaller } from "../auth";

const UPDATABLE_FIELDS = [
  "fullName",
  "birthday",
  "timerPresets",
  "gyms",
  "customExerciseNames",
  "customExerciseApparatuses",
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
        ).populate([{ path: "blocks", model: BlockModel }]);
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
          .populate([{ path: "blocks", model: BlockModel }])
          .lean();
        if (!user) return reply.code(404).send({ error: "User not found" });

        const blocks: Block[] = (user.blocks as unknown as Block[]) || [];

        const curBlock = blocks.find(
          (block) => String(block._id) === String(user.curBlock),
        );

        const previousCompletedExercises: CompletedExercise[] = blocks
          .flatMap((block) => {
            if (block._id === curBlock?._id) {
              return getCompletedDaysInBlock(block).flatMap((day) =>
                day.exercises.map((exercise) => ({
                  ...exercise,
                  completedDate: day.completedDate!,
                })),
              );
            }

            return block.weeks.flatMap((week) =>
              week.flatMap((day) =>
                day.exercises.map((exercise) => ({
                  ...exercise,
                  completedDate: day.completedDate!,
                })),
              ),
            );
          })
          .reverse();

        const currentCompletedExercises: Exercise[] = curBlock
          ? curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].exercises
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

  app.post<{ Params: IdParams; Body: { block: Block } }>(
    "/users/:id/startBlock",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const { block } = req.body;

      let newBlock;
      try {
        newBlock = await BlockModel.create(block);
      } catch (error) {
        console.error("Failed to create block:", error);
        return reply.code(500).send({ error: "Failed to create block" });
      }

      const deleteOrphanedBlock = async () => {
        try {
          await BlockModel.findOneAndDelete({ _id: newBlock._id });
        } catch (revertErr) {
          console.error(
            "Failed to delete orphaned block after user update failure:",
            revertErr,
          );
        }
      };

      try {
        const updatedUser = await UserModel.findOneAndUpdate(
          { _id: id },
          { $set: { curBlock: newBlock }, $addToSet: { blocks: newBlock } },
          { new: true },
        ).populate([{ path: "blocks", model: BlockModel }]);
        if (!updatedUser) {
          await deleteOrphanedBlock();
          return reply.code(404).send({ error: "User not found" });
        }
        return updatedUser;
      } catch (error) {
        await deleteOrphanedBlock();
        console.error("Failed to start block:", error);
        return reply.code(500).send({ error: "Failed to start block" });
      }
    },
  );

  app.post<{ Params: IdParams }>(
    "/users/:id/quitBlock",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const user = await UserModel.findOne({ _id: id });
      if (!user) return reply.code(404).send({ error: "User not found" });

      const block = await BlockModel.findOne({ _id: user.curBlock });
      if (!block)
        return reply
          .code(400)
          .send({ error: "User does not have a current block" });

      const weeks = block.weeks.slice(0, block.curWeekIdx + 1);
      const endDate = new Date();

      try {
        await BlockModel.findOneAndUpdate(
          { _id: user.curBlock },
          { $set: { weeks, endDate } },
        );
      } catch (error) {
        return reply
          .code(500)
          .send({ error: `Failed to update block: ${error}` });
      }

      const revertBlock = async () => {
        try {
          await BlockModel.findOneAndUpdate(
            { _id: user.curBlock },
            { $set: { weeks: block.weeks }, $unset: { endDate: "" } },
          );
        } catch (revertErr) {
          console.error(
            "Failed to revert block update after user update failure:",
            revertErr,
          );
        }
      };

      try {
        const updatedUser = await UserModel.findOneAndUpdate(
          { _id: id },
          { $unset: { curBlock: "" } },
          { new: true },
        ).populate([{ path: "blocks", model: BlockModel }]);
        if (!updatedUser) {
          await revertBlock();
          return reply.code(404).send({ error: "User not found" });
        }
        return updatedUser;
      } catch (error) {
        await revertBlock();
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
