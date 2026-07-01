import { Program } from "@liftledger/shared";
import {
  CompletedExercisesResponse,
  getNewSetsFromLatest,
} from "@liftledger/api-client";

// Builds a fresh template by duplicating the last rotation of an existing program.
// Used when History's "duplicate" action opens EditProgram with a source program id.
export const templateFromProgram = (
  program: Program,
  completedExercises: CompletedExercisesResponse | undefined,
): Program => ({
  name: program.name,
  startDate: new Date(),
  length: program.length,
  primaryGym: program.primaryGym,
  rotations: [
    // Use the LAST rotation that actually exists, not `program.length - 1`. Quitting
    // truncates `rotations` to the rotations completed so far; the original `length`
    // (the user's target) may be larger than what's in `rotations`.
    program.rotations[program.rotations.length - 1].map((session) => ({
      name: session.name,
      gym: program.primaryGym,
      exercises: session.exercises
        .filter((ex) => !ex.addedOn)
        .map((exercise) => ({
          name: exercise.name,
          equipment: exercise.equipment,
          gym: program.primaryGym,
          sets: getNewSetsFromLatest(completedExercises, {
            ...exercise,
            gym: program.primaryGym,
          }),
          weightType: exercise.weightType,
        })),
      completedDate: undefined,
    })),
  ],
  curSessionIdx: 0,
  curRotationIdx: 0,
  restDays: program.restDays ?? 0,
});
