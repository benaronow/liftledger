import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import type { Program, Session, Exercise, Set } from "@liftledger/shared";
import { isSameExercise } from "@liftledger/shared";

export const updateProgram = async ({
  reply,
  id,
  programId,
  program,
}: {
  reply: FastifyReply;
  id: string;
  programId: string;
  program: Program;
}) => {
  const curSession: Session =
    program.rotations[program.curRotationIdx][program.curSessionIdx];

  const isCurRotationDone =
    !!program.rotations[program.curRotationIdx][
      program.rotations[program.curRotationIdx].length - 1
    ].completedDate;

  const isCurProgramDone =
    program.curRotationIdx >= program.length - 1 && isCurRotationDone;

  const getLatestSet = (exercise: Exercise, idx: number): Set | null => {
    for (let w = program.rotations.length - 1; w >= 0; w--) {
      const rotation = program.rotations[w];
      for (let d = rotation.length - 1; d >= 0; d--) {
        const session = rotation[d];
        for (const e of session.exercises) {
          if (isSameExercise(e, exercise) && idx < e.workingSets.length) {
            return e.workingSets[idx];
          }
        }
      }
    }
    return null;
  };

  const createNextRotation = (): Session[] => {
    return program.rotations[program.curRotationIdx].map((session) => ({
      name: session.name,
      gym: program.primaryGym,
      exercises: session.exercises
        .filter((exercise) => !exercise.addedOn)
        .map((exercise) => {
          return {
            ...exercise,
            gym: program.primaryGym,
            warmupSets: (exercise.warmupSets ?? [])
              .filter((set) => !set.addedOn)
              .map((set) => ({
                ...set,
                completed: false,
                skipped: false,
                note: "",
              })),
            workingSets: exercise.workingSets
              .filter((set) => !set.addedOn)
              .map((set: Set, idx: number) => {
                const latestSet =
                  getLatestSet(
                    { ...exercise, gym: program.primaryGym },
                    idx,
                  ) ?? set;
                return {
                  ...latestSet,
                  completed: false,
                  skipped: false,
                  note: "",
                  dropSets: undefined,
                };
              }),
          };
        }),
      completedDate: undefined,
    }));
  };

  const programToSet = isCurProgramDone
    ? program
    : isCurRotationDone
      ? {
          ...program,
          rotations: [...program.rotations, createNextRotation()],
          curSessionIdx: 0,
          curRotationIdx: program.curRotationIdx + 1,
        }
      : {
          ...program,
          curSessionIdx:
            program.curSessionIdx + (curSession.completedDate ? 1 : 0),
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
};
