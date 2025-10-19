import { Block, Exercise } from "@/lib/types";

export const getLastExerciseOccurrence = (
  curBlock: Block,
  exercise: Exercise
) => {
  for (let w = curBlock.curWeekIdx + 1; w >= 0; w--) {
    for (
      let d =
        w === curBlock.curWeekIdx + 1
          ? curBlock.curDayIdx - 1
          : curBlock.weeks[w].length - 1;
      d >= 0;
      d--
    ) {
      for (const e of [curBlock.initialWeek, ...curBlock.weeks][w][d]
        .exercises) {
        if (e.name === exercise.name && e.apparatus === exercise.apparatus)
          return e;
      }
    }
  }
};

export const checkIsCurWeekDone = (block: Block) =>
  !!block.weeks[block.curWeekIdx][block.weeks[block.curWeekIdx].length - 1]
    .completedDate;

export const checkIsBlockDone = (block: Block) =>
  block.curWeekIdx >= block.length - 1 && checkIsCurWeekDone(block);
