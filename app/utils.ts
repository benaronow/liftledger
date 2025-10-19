import { Block, Exercise } from "@/lib/types";

export const getLastExerciseOccurrence = (
  curBlock: Block | undefined,
  exercise: Exercise
) => {
  if (!curBlock) return undefined;
  for (let w = curBlock.curWeekIdx + 1; w >= 0; w--) {
    for (
      let d =
        w === curBlock.curWeekIdx + 1
          ? curBlock.curDayIdx - 1
          : curBlock.weeks[w].length - 1;
      d >= 0;
      d--
    ) {
      if ([curBlock.initialWeek, ...curBlock.weeks][w][d]) {
        for (const e of [curBlock.initialWeek, ...curBlock.weeks][w][d]
          .exercises) {
          if (e.name === exercise.name && e.apparatus === exercise.apparatus)
            return e;
        }
      }
    }
  }
};

export const getNewSetsFromLast = (
  curBlock: Block | undefined,
  newExercise: Exercise
) => {
  return (
    getLastExerciseOccurrence(curBlock, newExercise)?.sets.map((set) => ({
      ...set,
      completed: false,
      note: "",
    })) ?? [{ reps: 0, weight: 0, note: "", completed: false }]
  );
};

export const checkIsCurWeekDone = (block: Block) =>
  !!block.weeks[block.curWeekIdx][block.weeks[block.curWeekIdx].length - 1]
    .completedDate;

export const checkIsBlockDone = (block: Block) =>
  block.curWeekIdx >= block.length - 1 && checkIsCurWeekDone(block);
