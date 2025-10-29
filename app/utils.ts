import { Block, Exercise } from "@/lib/types";

export const getLastExerciseOccurrence = (
  curBlock: Block | undefined,
  exercise: Exercise,
  includeInitial: boolean = true
) => {
  if (!curBlock) return undefined;

  const weeks = includeInitial
    ? [curBlock.initialWeek, ...curBlock.weeks]
    : curBlock.weeks;
  const curWeekIdx = includeInitial
    ? curBlock.curWeekIdx + 1
    : curBlock.curWeekIdx;

  for (let w = curWeekIdx; w >= 0; w--) {
    for (
      let d = w === curWeekIdx ? curBlock.curDayIdx - 1 : weeks[w].length - 1;
      d >= 0;
      d--
    ) {
      if (weeks[w][d]) {
        for (const e of weeks[w][d].exercises) {
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
