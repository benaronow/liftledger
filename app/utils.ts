import { Block, Exercise } from "@/types";

export const getTemplateFromBlock = (block: Block, editing: boolean) => {
  const template: Block = editing
    ? block
    : {
        name: block.name,
        startDate: new Date(),
        length: block.length,
        initialWeek: block.initialWeek,
        weeks: [
          {
            number: 1,
            days: block.weeks[block.length - 1].days.map((day) => {
              return {
                name: day.name,
                hasGroup: day.hasGroup,
                groupName: day.groupName,
                exercises: day.exercises.map((exercise) => {
                  return {
                    name: exercise.name,
                    apparatus: exercise.apparatus,
                    sets: exercise.sets,
                    weightType: exercise.weightType,
                    unilateral: exercise.unilateral,
                  };
                }),
                completed: false,
                completedDate: undefined,
              };
            }),
            completed: false,
          },
        ],
        completed: false,
        curDayIdx: 0,
        curWeekIdx: 0,
      };

  return template;
};

const checkCurrentWeekGroup = (curBlock: Block, exercise: Exercise) => {
  let prevExercise = undefined;
  for (let i = 0; i < curBlock.curDayIdx; i++) {
    const checkDayDetail = curBlock.weeks[curBlock.curWeekIdx].days[i];
    if (
      checkDayDetail?.hasGroup &&
      checkDayDetail.groupName ===
        curBlock.weeks[curBlock.curWeekIdx].days[curBlock.curDayIdx].groupName
    )
      prevExercise = checkDayDetail.exercises.find(
        (e) => e.name === exercise.name && e.apparatus === exercise.apparatus
      );
  }
  return prevExercise;
};

const checkPreviousOrInitialWeekGroup = (
  curBlock: Block,
  exercise: Exercise
) => {
  const prevWeekDayIdx =
    (curBlock.curWeekIdx > 0
      ? curBlock.weeks[curBlock.curWeekIdx - 1]
      : curBlock.initialWeek
    ).days.findLastIndex(
      (day) =>
        day.hasGroup &&
        day.groupName ===
          curBlock.weeks[curBlock.curWeekIdx].days[curBlock.curDayIdx].groupName
    ) || curBlock.curDayIdx;
  return curBlock.weeks[curBlock.curWeekIdx - 1].days[
    prevWeekDayIdx
  ].exercises.find(
    (e) => e.name === exercise.name && e.apparatus === exercise.apparatus
  );
};

const checkPreviousOrInitialWeekNoGroup = (
  curBlock: Block,
  exercise: Exercise
) => {
  return (
    curBlock.curWeekIdx > 0
      ? curBlock.weeks[curBlock.curWeekIdx - 1]
      : curBlock.initialWeek
  ).days[curBlock.curDayIdx].exercises.find(
    (e) => e.name === exercise.name && e.apparatus === exercise.apparatus
  );
};

export const getPreviousSessionExercise = (
  curBlock: Block,
  exercise: Exercise
) => {
  const curDayDetail =
    curBlock.weeks[curBlock.curWeekIdx].days[curBlock.curDayIdx];
  if (curDayDetail?.hasGroup) {
    return (
      checkCurrentWeekGroup(curBlock, exercise) ??
      checkPreviousOrInitialWeekGroup(curBlock, exercise)
    );
  }
  return checkPreviousOrInitialWeekNoGroup(curBlock, exercise);
};
