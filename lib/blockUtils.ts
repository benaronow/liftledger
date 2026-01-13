import {
  Block,
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  Set,
  WeightType,
} from "@/lib/types";
import { ChangeEvent } from "react";

export const findLatestOccurrence = <T>(
  curBlock: Block | undefined,
  checkerFunc: (e: Exercise) => T | undefined,
  previous: boolean = false
) => {
  if (!curBlock) return undefined;

  for (let w = curBlock.curWeekIdx; w >= 0; w--) {
    for (
      let d =
        w === curBlock.curWeekIdx
          ? curBlock.curDayIdx - (previous ? 1 : 0)
          : curBlock.weeks[w].length - 1;
      d >= 0;
      d--
    ) {
      if (curBlock.weeks[w][d]) {
        for (const e of curBlock.weeks[w][d].exercises) {
          if (checkerFunc(e)) return checkerFunc(e);
        }
      }
    }
  }
};

export const getNewSetsFromLatest = (
  curBlock: Block | undefined,
  exercise: Exercise,
  numSets?: number
) => {
  const curSets = curBlock
    ? curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].exercises.find(
        (ex) =>
          ex.name === exercise.name &&
          ex.apparatus === exercise.apparatus &&
          ex.gym === exercise.gym
      )?.sets
    : undefined;

  const prevSets = findLatestOccurrence(curBlock, (e: Exercise) => {
    if (
      e.name === exercise.name &&
      e.apparatus === exercise.apparatus &&
      e.gym === exercise.gym
    )
      return e;
  })?.sets.map(
    (set) => ({
      ...set,
      completed: false,
      skipped: undefined,
      note: "",
    }),
    true
  );

  const sets = curSets ??
    prevSets ?? [{ reps: 0, weight: 0, note: "", completed: false }];

  if (numSets !== undefined)
    return numSets < sets.length
      ? sets.slice(0, numSets)
      : sets.concat(
          Array<Set>(numSets - sets.length).fill(sets[sets.length - 1])
        );

  return sets;
};

export const switchExercise = (
  e: ChangeEvent<HTMLSelectElement>,
  type: "name" | "apparatus" | "weightType",
  curBlock: Block | undefined,
  exercise: Exercise,
  updateFunc: (newExercise: Exercise) => void
) => {
  const newExercise = {
    ...exercise,
    name: type === "name" ? (e.target.value as ExerciseName) : exercise.name,
    apparatus:
      type === "apparatus"
        ? (e.target.value as ExerciseApparatus)
        : exercise.apparatus,
    weightType:
      type === "weightType"
        ? (e.target.value as WeightType)
        : exercise.weightType,
  };

  updateFunc({
    ...newExercise,
    sets:
      type === "weightType"
        ? newExercise.sets
        : getNewSetsFromLatest(curBlock, newExercise),
  });
};

export const getAvailableOptions = (
  curExercise: Exercise,
  exercises: Exercise[],
  type: "name" | "apparatus"
) => {
  const takenExercises = exercises.filter(
    (e) =>
      !(e.name === curExercise.name && e.apparatus === curExercise.apparatus)
  );

  return Object.values(
    type === "name" ? ExerciseName : ExerciseApparatus
  ).filter(
    (o) =>
      !takenExercises.find((e) => {
        if (type === "name")
          return e.name === o && e.apparatus === curExercise.apparatus;
        if (type === "apparatus")
          return e.apparatus === o && e.name === curExercise.name;
        return false;
      })
  );
};

export const checkIsCurWeekDone = (block: Block) =>
  !!block.weeks[block.curWeekIdx][block.weeks[block.curWeekIdx].length - 1]
    .completedDate;

export const checkIsBlockDone = (block: Block) =>
  block.curWeekIdx >= block.length - 1 && checkIsCurWeekDone(block);
