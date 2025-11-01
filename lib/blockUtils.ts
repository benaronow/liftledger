import { Block, Exercise } from "@/lib/types";

export const findLatestPreviousOccurrence = <T>(
  curBlock: Block | undefined,
  checker: (e: Exercise) => T | undefined
) => {
  if (!curBlock) return undefined;

  for (let w = curBlock.curWeekIdx; w >= 0; w--) {
    for (
      let d =
        w === curBlock.curWeekIdx
          ? curBlock.curDayIdx - 1
          : curBlock.weeks[w].length - 1;
      d >= 0;
      d--
    ) {
      if (curBlock.weeks[w][d]) {
        for (const e of curBlock.weeks[w][d].exercises) {
          return checker(e);
        }
      }
    }
  }
};

export const getNewSetsFromLatest = (
  curBlock: Block | undefined,
  exercise: Exercise
) => {
  if (!curBlock) return [];

  const curSets = curBlock.weeks[curBlock.curWeekIdx][
    curBlock.curDayIdx
  ].exercises.find(
    (ex) => ex.name === exercise.name && ex.apparatus === exercise.apparatus
  )?.sets;

  const prevSets = findLatestPreviousOccurrence(curBlock, (e: Exercise) => {
    if (e.name === exercise.name && e.apparatus === exercise.apparatus)
      return e;
  })?.sets.map((set) => ({
    ...set,
    completed: false,
    skipped: undefined,
    note: "",
  }));

  return (
    curSets ?? prevSets ?? [{ reps: 0, weight: 0, note: "", completed: false }]
  );
};

export const getBlockNoAddOns = (block: Block) => ({
  ...block,
  weeks: block.weeks.map((week) =>
    week.map((day) => ({
      ...day,
      exercises: day.exercises.filter((ex) => !ex.addedOn),
    }))
  ),
});

export const checkIsCurWeekDone = (block: Block) =>
  !!block.weeks[block.curWeekIdx][block.weeks[block.curWeekIdx].length - 1]
    .completedDate;

export const checkIsBlockDone = (block: Block) =>
  block.curWeekIdx >= block.length - 1 && checkIsCurWeekDone(block);
