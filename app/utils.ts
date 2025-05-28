import { Block, Exercise, Set } from "@/types";

export const getTemplateFromBlock = (block: Block, editing: boolean) => {
  const template: Block = editing
    ? block
    : {
        name: block.name,
        startDate: new Date(),
        length: block.length,
        initialWeek: block.initialWeek,
        weeks: [
          block.weeks[block.length - 1].map((day) => {
            return {
              name: day.name,
              exercises: day.exercises.map((exercise) => {
                return {
                  name: exercise.name,
                  apparatus: exercise.apparatus,
                  sets: exercise.sets.map((set: Set) => ({
                    ...set,
                    completed: false,
                    note: "",
                  })),
                  weightType: exercise.weightType,
                };
              }),
              completedDate: undefined,
            };
          }),
        ],
        curDayIdx: 0,
        curWeekIdx: 0,
      };

  return template;
};

export const getLastExerciseOccurrence = (
  curBlock: Block,
  exercise: Exercise
) => {
  for (let w = curBlock.curWeekIdx; w >= 0; w--) {
    for (
      let d =
        w === curBlock.curWeekIdx
          ? curBlock.curDayIdx - 1
          : curBlock.weeks[w].length - 1;
      d >= 0;
      d--
    ) {
      for (const e of curBlock.weeks.concat(curBlock.initialWeek)[w][d]
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
