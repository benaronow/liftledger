import { useMemo } from "react";
import type { Exercise, Set } from "@liftledger/shared";
import { useProgram } from "../api/programs";

export const isExerciseComplete = (exercise: Exercise) =>
  exercise.workingSets.length !== 0 &&
  exercise.workingSets.every(
    (set: Set) => set.completed || (set.skipped ?? false),
  );

export const useCurrentSession = () => {
  const { data: curProgram, isLoading } = useProgram();

  const exercises = useMemo<Exercise[]>(
    () =>
      curProgram
        ? curProgram.rotations[curProgram.curRotationIdx][
            curProgram.curSessionIdx
          ].exercises
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
        exercise.workingSets.some((set) => set.completed || set.skipped),
      ),
    [exercises],
  );

  const isSessionComplete = useMemo(
    () => exercises.every(isExerciseComplete),
    [exercises],
  );

  return {
    exercises,
    currentExIdx,
    isSessionStarted,
    isSessionComplete,
    isLoading,
  };
};
