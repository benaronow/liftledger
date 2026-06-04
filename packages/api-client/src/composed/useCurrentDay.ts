import { useMemo } from "react";
import type { Exercise, Set } from "@liftledger/shared";
import { useMe } from "../api/useMe";
import { useBlock } from "../api/useBlock";

export const isExerciseComplete = (exercise: Exercise) =>
  exercise.sets.length !== 0 &&
  exercise.sets.every((set: Set) => set.completed || (set.skipped ?? false));

export const useCurrentDay = () => {
  const { data: curUser } = useMe();
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);

  const exercises = useMemo<Exercise[]>(
    () =>
      curBlock
        ? curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].exercises
        : [],
    [curBlock],
  );

  const currentExIdx = useMemo(
    () => exercises.findIndex((exercise) => !isExerciseComplete(exercise)),
    [exercises],
  );

  const isDayStarted = useMemo(
    () =>
      exercises.some((exercise) =>
        exercise.sets.some((set) => set.completed || set.skipped),
      ),
    [exercises],
  );

  const isDayComplete = useMemo(
    () => exercises.every(isExerciseComplete),
    [exercises],
  );

  return { exercises, currentExIdx, isDayStarted, isDayComplete };
};
