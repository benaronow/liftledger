import { Exercise } from "@liftledger/shared";
import { EXERCISE_NAMES } from "@liftledger/shared";
import { EXERCISE_EQUIPMENT } from "@liftledger/shared";
import { useCallback, useMemo } from "react";
import { useMe } from "../api/useMe";
import { useUpdateUser } from "../api/useUser";

const getAllOptions = (baseOptions: string[], customOptions?: string[]) => {
  const filteredCustom =
    customOptions?.filter(
      (c) =>
        !baseOptions.some((b: string) => b.toLowerCase() === c.toLowerCase()),
    ) ?? [];

  return [...baseOptions, ...filteredCustom].sort();
};

export const useExerciseOptions = () => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateUser } = useUpdateUser();

  const allExerciseNameOptions = useMemo<string[]>(
    () => getAllOptions(EXERCISE_NAMES, curUser?.customExerciseNames),
    [curUser],
  );

  const allExerciseEquipmentOptions = useMemo<string[]>(
    () =>
      getAllOptions(EXERCISE_EQUIPMENT, curUser?.customExerciseEquipment),
    [curUser],
  );

  const addCustomExerciseName = useCallback(
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
        customExerciseNames: [...(curUser.customExerciseNames ?? []), value],
      });
    },
    [curUser, allExerciseNameOptions, triggerUpdateUser],
  );

  const addCustomExerciseEquipment = useCallback(
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
        customExerciseEquipment: [
          ...(curUser.customExerciseEquipment ?? []),
          value,
        ],
      });
    },
    [curUser, allExerciseEquipmentOptions, triggerUpdateUser],
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
    addCustomExerciseName,
    addCustomExerciseEquipment,
    allExerciseNameOptions,
    getAvailableExerciseNameOptions,
    allExerciseEquipmentOptions,
    getAvailableExerciseEquipmentOptions,
  };
};
