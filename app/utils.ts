import { Block, Exercise } from "@/lib/types";

export const getLastExerciseOccurrence = (
  curBlock: Block | undefined,
  exercise: Exercise,
  includeInitial: boolean = false
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

export const getLastSetOccurrence = (
  curBlock: Block | undefined,
  exercise: Exercise,
  setIdx: number,
  completed: boolean = false
) => {
  if (!curBlock) return undefined;

  const weeks = curBlock.weeks;
  const curWeekIdx = curBlock.curWeekIdx;

  for (let w = curWeekIdx; w >= 0; w--) {
    for (
      let d = w === curWeekIdx ? curBlock.curDayIdx - 1 : weeks[w].length - 1;
      d >= 0;
      d--
    ) {
      if (weeks[w][d]) {
        for (const e of weeks[w][d].exercises) {
          if (
            e.name === exercise.name &&
            e.apparatus === exercise.apparatus &&
            e.sets[setIdx] &&
            (!completed || e.sets[setIdx].completed)
          )
            return e.sets[setIdx];
        }
      }
    }
  }
};

export const getNewSetsFromLast = (
  curBlock: Block | undefined,
  newExercise: Exercise
) => {
  if (!curBlock) return [];

  const curSets = curBlock.weeks[curBlock.curWeekIdx][
    curBlock.curDayIdx
  ].exercises.find(
    (ex) =>
      ex.name === newExercise.name && ex.apparatus === newExercise.apparatus
  )?.sets;

  return (
    curSets ??
    getLastExerciseOccurrence(curBlock, newExercise, true)?.sets.map((set) => ({
      ...set,
      completed: false,
      skipped: undefined,
      note: "",
    })) ?? [{ reps: 0, weight: 0, note: "", completed: false }]
  );
};

export const getBlockNoAddOns = (block: Block) => ({
  ...block,
  weeks: block.weeks.map((week) =>
    week.map((day) => ({
      ...day,
      exercises: day.exercises.filter((ex) => !ex.addOn),
    }))
  ),
});

export const checkIsCurWeekDone = (block: Block) =>
  !!block.weeks[block.curWeekIdx][block.weeks[block.curWeekIdx].length - 1]
    .completedDate;

export const checkIsBlockDone = (block: Block) =>
  block.curWeekIdx >= block.length - 1 && checkIsCurWeekDone(block);
