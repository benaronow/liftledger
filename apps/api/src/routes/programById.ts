import type { FastifyInstance } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import type { Program, Day, Exercise, Set } from "@liftledger/shared";
import { isSameExercise } from "@liftledger/shared";
import { authorizeCaller } from "../auth";

type ProgramParams = { id: string; programId: string };

const programByIdRoutes = async (app: FastifyInstance) => {
  app.get<{ Params: ProgramParams }>(
    "/users/:id/programs/:programId",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id, programId } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      try {
        const program = await ProgramModel.findOne({ _id: programId });
        if (!program) return reply.code(404).send({ error: "Program not found" });
        return program;
      } catch (error) {
        console.error("Failed to fetch program:", error);
        return reply.code(500).send({ error: "Failed to fetch program" });
      }
    },
  );

  app.put<{ Params: ProgramParams; Body: { program: Program } }>(
    "/users/:id/programs/:programId",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id, programId } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const { program } = req.body;

      const curDay: Day = program.weeks[program.curWeekIdx][program.curDayIdx];

      const isCurWeekDone =
        !!program.weeks[program.curWeekIdx][
          program.weeks[program.curWeekIdx].length - 1
        ].completedDate;

      const isCurProgramDone =
        program.curWeekIdx >= program.length - 1 && isCurWeekDone;

      const getLatestSet = (exercise: Exercise, idx: number): Set | null => {
        for (let w = program.weeks.length - 1; w >= 0; w--) {
          const week = program.weeks[w];
          for (let d = week.length - 1; d >= 0; d--) {
            const day = week[d];
            for (const e of day.exercises) {
              if (isSameExercise(e, exercise) && idx < e.sets.length) {
                return e.sets[idx];
              }
            }
          }
        }
        return null;
      };

      const createNextWeek = (): Day[] => {
        return program.weeks[program.curWeekIdx].map((day) => ({
          name: day.name,
          gym: program.primaryGym,
          exercises: day.exercises
            .filter((exercise) => !exercise.addedOn)
            .map((exercise) => {
              return {
                ...exercise,
                gym: program.primaryGym,
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

      const programToSet = isCurProgramDone
        ? program
        : isCurWeekDone
          ? {
              ...program,
              weeks: [...program.weeks, createNextWeek()],
              curDayIdx: 0,
              curWeekIdx: program.curWeekIdx + 1,
            }
          : {
              ...program,
              curDayIdx: program.curDayIdx + (curDay.completedDate ? 1 : 0),
            };

      let newProgram;
      try {
        newProgram = await ProgramModel.findOneAndUpdate(
          { _id: programId },
          { $set: programToSet },
          { new: true },
        );
      } catch (error) {
        console.error("Failed to update program:", error);
        return reply.code(500).send({ error: "Failed to update program" });
      }
      if (!newProgram) return reply.code(404).send({ error: "Program not found" });

      if (isCurProgramDone) {
        try {
          await UserModel.findOneAndUpdate(
            { _id: id },
            { $unset: { curProgram: "" } },
            { new: true },
          );
        } catch (error) {
          console.error("Failed to clear curProgram on user:", error);
          return reply.code(500).send({ error: "Failed to finish program" });
        }
      }

      return { program: newProgram, done: isCurProgramDone };
    },
  );
};

export default programByIdRoutes;
