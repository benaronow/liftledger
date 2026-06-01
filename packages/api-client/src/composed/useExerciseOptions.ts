import { Exercise } from "@liftledger/shared";
import { EXERCISE_NAMES } from "@liftledger/shared";
import { EXERCISE_APPARATUSES } from "@liftledger/shared";
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

  const allExerciseApparatusOptions = useMemo<string[]>(
    () =>
      getAllOptions(EXERCISE_APPARATUSES, curUser?.customExerciseApparatuses),
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

  const addCustomExerciseApparatus = useCallback(
    async (value: string) => {
      if (
        !curUser ||
        allExerciseApparatusOptions
          .map((o) => o.toLowerCase())
          .includes(value.toLowerCase())
      )
        return;

      await triggerUpdateUser({
        ...curUser,
        customExerciseApparatuses: [
          ...(curUser.customExerciseApparatuses ?? []),
          value,
        ],
      });
    },
    [curUser, allExerciseApparatusOptions, triggerUpdateUser],
  );

  const getAvailableExerciseNameOptions = useCallback(
    (curExercise: Exercise, allReservedExercises: Exercise[]) => {
      const unavailableExercises = allReservedExercises.filter(
        (e) =>
          e.name !== curExercise.name || e.apparatus !== curExercise.apparatus,
      );

      return allExerciseNameOptions.filter(
        (n) =>
          !unavailableExercises.find(
            (e) => e.name === n && e.apparatus === curExercise.apparatus,
          ),
      );
    },
    [allExerciseNameOptions],
  );

  const getAvailableExerciseApparatusOptions = useCallback(
    (curExercise: Exercise, allReservedExercises: Exercise[]) => {
      const unavailableExercises = allReservedExercises.filter(
        (e) =>
          e.name !== curExercise.name || e.apparatus !== curExercise.apparatus,
      );

      return allExerciseApparatusOptions.filter(
        (a) =>
          !unavailableExercises.find(
            (e) => e.apparatus === a && e.name === curExercise.name,
          ),
      );
    },
    [allExerciseApparatusOptions],
  );

  return {
    addCustomExerciseName,
    addCustomExerciseApparatus,
    allExerciseNameOptions,
    getAvailableExerciseNameOptions,
    allExerciseApparatusOptions,
    getAvailableExerciseApparatusOptions,
  };
};
