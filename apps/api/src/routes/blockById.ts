import type { FastifyInstance } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import BlockModel from "@liftledger/shared/models/block";
import type { Block, Day, Exercise, Set } from "@liftledger/shared";
import { authorizeCaller } from "../auth";

type BlockParams = { id: string; blockId: string };

const blockByIdRoutes = async (app: FastifyInstance) => {
  app.get<{ Params: BlockParams }>(
    "/users/:id/blocks/:blockId",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id, blockId } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      try {
        const block = await BlockModel.findOne({ _id: blockId });
        if (!block) return reply.code(404).send({ error: "Block not found" });
        return block;
      } catch (error) {
        console.error("Failed to fetch block:", error);
        return reply.code(500).send({ error: "Failed to fetch block" });
      }
    },
  );

  app.put<{ Params: BlockParams; Body: { block: Block } }>(
    "/users/:id/blocks/:blockId",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id, blockId } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const { block } = req.body;

      const curDay: Day = block.weeks[block.curWeekIdx][block.curDayIdx];

      const isCurWeekDone =
        !!block.weeks[block.curWeekIdx][
          block.weeks[block.curWeekIdx].length - 1
        ].completedDate;

      const isCurBlockDone =
        block.curWeekIdx >= block.length - 1 && isCurWeekDone;

      const getLatestSet = (exercise: Exercise, idx: number): Set | null => {
        for (let w = block.weeks.length - 1; w >= 0; w--) {
          const week = block.weeks[w];
          for (let d = week.length - 1; d >= 0; d--) {
            const day = week[d];
            for (const e of day.exercises) {
              if (
                e.name === exercise.name &&
                e.apparatus === exercise.apparatus &&
                e.gym === block.primaryGym &&
                idx < e.sets.length
              ) {
                return e.sets[idx];
              }
            }
          }
        }
        return null;
      };

      const createNextWeek = (): Day[] => {
        return block.weeks[block.curWeekIdx].map((day) => ({
          name: day.name,
          gym: block.primaryGym,
          exercises: day.exercises
            .filter((exercise) => !exercise.addedOn)
            .map((exercise) => {
              return {
                ...exercise,
                gym: block.primaryGym,
                sets: exercise.sets
                  .filter((set) => !set.addedOn)
                  .map((set: Set, idx: number) => {
                    const latestSet = getLatestSet(exercise, idx) ?? set;
                    return {
                      ...latestSet,
                      completed: false,
                      skipped: false,
                      note: "",
                    };
                  }),
              };
            }),
          completedDate: undefined,
        }));
      };

      const blockToSet = isCurBlockDone
        ? block
        : isCurWeekDone
          ? {
              ...block,
              weeks: [...block.weeks, createNextWeek()],
              curDayIdx: 0,
              curWeekIdx: block.curWeekIdx + 1,
            }
          : {
              ...block,
              curDayIdx: block.curDayIdx + (curDay.completedDate ? 1 : 0),
            };

      let newBlock;
      try {
        newBlock = await BlockModel.findOneAndUpdate(
          { _id: blockId },
          { $set: blockToSet },
          { new: true },
        );
      } catch (error) {
        console.error("Failed to update block:", error);
        return reply.code(500).send({ error: "Failed to update block" });
      }
      if (!newBlock)
        return reply.code(404).send({ error: "Block not found" });

      if (isCurBlockDone) {
        try {
          await UserModel.findOneAndUpdate(
            { _id: id },
            { $unset: { curBlock: "" } },
            { new: true },
          );
        } catch (error) {
          console.error("Failed to clear curBlock on user:", error);
          return reply.code(500).send({ error: "Failed to finish block" });
        }
      }

      return { block: newBlock, done: isCurBlockDone };
    },
  );
};

export default blockByIdRoutes;
