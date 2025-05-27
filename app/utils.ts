import { Block, Exercise, Set } from "@/types";

export const getTemplateFromBlock = (block: Block, editing: boolean) => {
  const template: Block = editing
    ? block
    : {
        name: block.name,
        startDate: block.startDate,
        length: block.length,
        initialWeek: block.initialWeek,
        weeks: [
          {
            number: 1,
            days: block.weeks[block.length - 1].days.map((day) => {
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
              };
            }),
          },
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
          : curBlock.weeks[w].days.length - 1;
      d >= 0;
      d--
    ) {
      for (const e of curBlock.weeks.concat(curBlock.initialWeek)[w].days[d]
        .exercises) {
        if (e.name === exercise.name && e.apparatus === exercise.apparatus)
          return e;
      }
    }
  }
};

export const checkIsCurWeekDone = (block: Block) =>
  block.weeks[block.curWeekIdx].days.length - 1 === block.curDayIdx &&
  block.weeks[block.curWeekIdx].days[block.curDayIdx].completedDate;

export const checkIsBlockDone = (block: Block) =>
  block.curWeekIdx >= block.length - 1 && checkIsCurWeekDone(block);
