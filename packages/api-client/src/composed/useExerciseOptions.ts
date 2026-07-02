import { Exercise } from "@liftledger/shared";
import { useCallback, useMemo } from "react";
import { useMe } from "../api/useMe";
import { useUpdateUser } from "../api/useUser";

const sorted = (options?: string[]) => [...(options ?? [])].sort();

export const useExerciseOptions = () => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateUser } = useUpdateUser();

  const allExerciseNameOptions = useMemo<string[]>(
    () => sorted(curUser?.exerciseNames),
    [curUser],
  );

  const allExerciseEquipmentOptions = useMemo<string[]>(
    () => sorted(curUser?.exerciseEquipment),
    [curUser],
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
        exerciseNames: (curUser.exerciseNames ?? []).filter(
          (o) => o !== value,
        ),
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

  const getAvailableExerciseNameOptions = useCallback(
    (curExercise: Exercise, allReservedExercises: Exercise[]) => {
      const unavailableExercises = allReservedExercises.filter(
        (e) =>
          e.name !== curExercise.name || e.equipment !== curExercise.equipment,
      );

      return allExerciseNameOptions.filter(
        (n) =>
          !unavailableExercises.find(
            (e) => e.name === n && e.equipment === curExercise.equipment,
          ),
      );
    },
    [allExerciseNameOptions],
  );

  const getAvailableExerciseEquipmentOptions = useCallback(
    (curExercise: Exercise, allReservedExercises: Exercise[]) => {
      const unavailableExercises = allReservedExercises.filter(
        (e) =>
          e.name !== curExercise.name || e.equipment !== curExercise.equipment,
      );

      return allExerciseEquipmentOptions.filter(
        (a) =>
          !unavailableExercises.find(
            (e) => e.equipment === a && e.name === curExercise.name,
          ),
      );
    },
    [allExerciseEquipmentOptions],
  );

  return {
    addExerciseName,
    addExerciseEquipment,
    deleteExerciseName,
    deleteExerciseEquipment,
    allExerciseNameOptions,
    getAvailableExerciseNameOptions,
    allExerciseEquipmentOptions,
    getAvailableExerciseEquipmentOptions,
  };
};
