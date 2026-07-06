import { Exercise } from "@liftledger/shared";
import { useCallback, useMemo } from "react";
import { useMe } from "../api/useMe";
import { useUpdateUser } from "../api/useUser";

export interface CurrentExercisesState {
  curExercise: Exercise;
  allReservedExercises: Exercise[];
}

export const useExerciseOptions = (exercisesState?: CurrentExercisesState) => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateUser } = useUpdateUser();

  const allExerciseNameOptions = useMemo<string[]>(
    () => (curUser ? curUser.exerciseNames.toSorted() : []),
    [curUser],
  );

  const allExerciseEquipmentOptions = useMemo<string[]>(
    () => (curUser ? curUser.exerciseEquipment.toSorted() : []),
    [curUser],
  );

  const potentialExerciseAvailable = useCallback(
    (potentialExercise: Exercise) => {
      const { curExercise, allReservedExercises } = exercisesState!;

      const unavailableExercises = allReservedExercises.filter(
        (e) =>
          e.name !== curExercise.name || e.equipment !== curExercise.equipment,
      );

      const potentialExerciseUnavailable = unavailableExercises.find(
        (e) =>
          e.name === potentialExercise.name &&
          e.equipment === potentialExercise.equipment,
      );

      return !potentialExerciseUnavailable;
    },
    [exercisesState],
  );

  const availableExerciseNameOptions = useMemo(
    () =>
      exercisesState
        ? allExerciseNameOptions.filter((name) =>
            potentialExerciseAvailable({ ...exercisesState.curExercise, name }),
          )
        : allExerciseNameOptions,
    [allExerciseNameOptions, exercisesState, potentialExerciseAvailable],
  );

  const availableExerciseEquipmentOptions = useMemo(
    () =>
      exercisesState
        ? allExerciseEquipmentOptions.filter((equipment) =>
            potentialExerciseAvailable({
              ...exercisesState.curExercise,
              equipment,
            }),
          )
        : allExerciseEquipmentOptions,
    [allExerciseEquipmentOptions, exercisesState, potentialExerciseAvailable],
  );

  const addExerciseName = useCallback(
    async (value: string) => {
      if (
        !curUser ||
        allExerciseNameOptions
          .map((o) => o.toLowerCase())
          .includes(value.toLowerCase())
      )
        return;

      await triggerUpdateUser({
        ...curUser,
        exerciseNames: [...(curUser.exerciseNames ?? []), value],
      });
    },
    [curUser, allExerciseNameOptions, triggerUpdateUser],
  );

  const addExerciseEquipment = useCallback(
    async (value: string) => {
      if (
        !curUser ||
        allExerciseEquipmentOptions
          .map((o) => o.toLowerCase())
          .includes(value.toLowerCase())
      )
        return;

      await triggerUpdateUser({
        ...curUser,
        exerciseEquipment: [...(curUser.exerciseEquipment ?? []), value],
      });
    },
    [curUser, allExerciseEquipmentOptions, triggerUpdateUser],
  );

  const deleteExerciseName = useCallback(
    async (value: string) => {
      if (!curUser) return;
      await triggerUpdateUser({
        ...curUser,
        exerciseNames: (curUser.exerciseNames ?? []).filter((o) => o !== value),
      });
    },
    [curUser, triggerUpdateUser],
  );

  const deleteExerciseEquipment = useCallback(
    async (value: string) => {
      if (!curUser) return;
      await triggerUpdateUser({
        ...curUser,
        exerciseEquipment: (curUser.exerciseEquipment ?? []).filter(
          (o) => o !== value,
        ),
      });
    },
    [curUser, triggerUpdateUser],
  );

  return {
    allExerciseNameOptions,
    allExerciseEquipmentOptions,
    availableExerciseNameOptions,
    availableExerciseEquipmentOptions,
    addExerciseName,
    addExerciseEquipment,
    deleteExerciseName,
    deleteExerciseEquipment,
  };
};
