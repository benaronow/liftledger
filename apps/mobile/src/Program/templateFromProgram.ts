import { Program } from "@liftledger/shared";
import {
  CompletedExercisesResponse,
  getNewSetsFromLatest,
} from "@liftledger/api-client";

export const templateFromProgram = (
  program: Program,
  completedExercises: CompletedExercisesResponse | undefined,
): Program => ({
  name: program.name,
  length: program.length,
  primaryGym: program.primaryGym,
  rotations: [
    program.rotations[program.rotations.length - 1].map((session) => ({
      name: session.name,
      gym: program.primaryGym,
      exercises: session.exercises
        .filter((ex) => !ex.addedOn)
        .map((exercise) => ({
          name: exercise.name,
          equipment: exercise.equipment,
          gym: program.primaryGym,
          workingSets: getNewSetsFromLatest(completedExercises, {
            ...exercise,
            gym: program.primaryGym,
          }),
          unit: exercise.unit,
        })),
      completedDate: undefined,
    })),
  ],
  curSessionIdx: 0,
  curRotationIdx: 0,
  restDays: program.restDays ?? 0,
});
