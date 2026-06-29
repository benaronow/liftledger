import { useMemo } from "react";
import type { Exercise, Set } from "@liftledger/shared";
import { useMe } from "../api/useMe";
import { useProgram } from "../api/useProgram";

export const isExerciseComplete = (exercise: Exercise) =>
  exercise.sets.length !== 0 &&
  exercise.sets.every((set: Set) => set.completed || (set.skipped ?? false));

export const useCurrentSession = () => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);

  const exercises = useMemo<Exercise[]>(
    () =>
      curProgram
        ? curProgram.rotations[curProgram.curRotationIdx][curProgram.curSessionIdx].exercises
        : [],
    [curProgram],
  );

  const currentExIdx = useMemo(
    () => exercises.findIndex((exercise) => !isExerciseComplete(exercise)),
    [exercises],
  );

  const isSessionStarted = useMemo(
    () =>
      exercises.some((exercise) =>
        exercise.sets.some((set) => set.completed || set.skipped),
      ),
    [exercises],
  );

  const isSessionComplete = useMemo(
    () => exercises.every(isExerciseComplete),
    [exercises],
  );

  return { exercises, currentExIdx, isSessionStarted, isSessionComplete };
};
