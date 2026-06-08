import { Program } from "@liftledger/shared";
import {
  CompletedExercisesResponse,
  getNewSetsFromLatest,
} from "@liftledger/api-client";

// Builds a fresh template by duplicating the last week of an existing program.
// Used by /edit-program when the URL carries ?duplicateFrom=<programId>.
export const templateFromProgram = (
  program: Program,
  completedExercises: CompletedExercisesResponse | undefined,
): Program => ({
  name: program.name,
  startDate: new Date(),
  length: program.length,
  primaryGym: program.primaryGym,
  weeks: [
    // Use the LAST week that actually exists, not `program.length - 1`. Quitting
    // truncates `weeks` to the weeks completed so far; the original `length`
    // (the user's target) may be larger than what's in `weeks`.
    program.weeks[program.weeks.length - 1].map((day) => ({
      name: day.name,
      gym: program.primaryGym,
      exercises: day.exercises
        .filter((ex) => !ex.addedOn)
        .map((exercise) => ({
          name: exercise.name,
          apparatus: exercise.apparatus,
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
  curDayIdx: 0,
  curWeekIdx: 0,
});
