import { Block } from "@liftledger/shared";
import {
  CompletedExercisesResponse,
  getNewSetsFromLatest,
} from "@liftledger/api-client";

// Builds a fresh template by duplicating the last week of an existing block.
// Used when History's "duplicate" action opens EditBlock with a source block id.
export const templateFromBlock = (
  block: Block,
  completedExercises: CompletedExercisesResponse | undefined,
): Block => ({
  name: block.name,
  startDate: new Date(),
  length: block.length,
  primaryGym: block.primaryGym,
  weeks: [
    // Use the LAST week that actually exists, not `block.length - 1`. Quitting
    // truncates `weeks` to the weeks completed so far; the original `length`
    // (the user's target) may be larger than what's in `weeks`.
    block.weeks[block.weeks.length - 1].map((day) => ({
      name: day.name,
      gym: block.primaryGym,
      exercises: day.exercises
        .filter((ex) => !ex.addedOn)
        .map((exercise) => ({
          name: exercise.name,
          apparatus: exercise.apparatus,
          gym: block.primaryGym,
          sets: getNewSetsFromLatest(completedExercises, {
            ...exercise,
            gym: block.primaryGym,
          }),
          weightType: exercise.weightType,
        })),
      completedDate: undefined,
    })),
  ],
  curDayIdx: 0,
  curWeekIdx: 0,
});
