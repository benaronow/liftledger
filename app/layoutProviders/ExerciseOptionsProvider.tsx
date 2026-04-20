"use client";

import { Exercise } from "@/lib/types";
import { EXERCISE_NAMES } from "@/lib/exerciseNames";
import { EXERCISE_APPARATUSES } from "@/lib/exerciseApparatuses";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
} from "react";
import { useUser } from "./UserProvider";

interface ExerciseOptionsContextModel {
  addCustomExerciseName: (value: string) => Promise<void>;
  addCustomExerciseApparatus: (value: string) => Promise<void>;
  getAllExerciseNameOptions: () => string[];
  getAvailableExerciseNameOptions: (
    curExercise: Exercise,
    allReservedExercises: Exercise[],
  ) => string[];
  getAllExerciseApparatusOptions: () => string[];
  getAvailableExerciseApparatusOptions: (
    curExercise: Exercise,
    allReservedExercises: Exercise[],
  ) => string[];
}

const defaultExerciseOptionsContext: ExerciseOptionsContextModel = {
  addCustomExerciseName: async () => {},
  addCustomExerciseApparatus: async () => {},
  getAllExerciseNameOptions: () => [],
  getAvailableExerciseNameOptions: () => [],
  getAllExerciseApparatusOptions: () => [],
  getAvailableExerciseApparatusOptions: () => [],
};

export const ExcerciseOptionsContext = createContext(
  defaultExerciseOptionsContext,
);

export const ExerciseOptionsProvider = ({
  children,
}: PropsWithChildren<object>) => {
  const { curUser, updateUser } = useUser();

  const getAllOptions = (baseOptions: string[], customOptions?: string[]) => {
    const filteredCustom =
      customOptions?.filter(
        (c) =>
          !baseOptions.some((b: string) => b.toLowerCase() === c.toLowerCase()),
      ) ?? [];

    return [...baseOptions, ...filteredCustom];
  };

  const getAllExerciseNameOptions = useCallback(
    () => getAllOptions(EXERCISE_NAMES, curUser?.customExerciseNames),
    [curUser],
  );

  const getAllExerciseApparatusOptions = useCallback(
    () =>
      getAllOptions(EXERCISE_APPARATUSES, curUser?.customExerciseApparatuses),
    [curUser],
  );

  const addCustomExerciseName = useCallback(
    async (value: string) => {
      if (
        !curUser ||
        getAllExerciseNameOptions()
          .map((o) => o.toLowerCase())
          .includes(value.toLowerCase())
      )
        return;

      await updateUser({
        ...curUser,
        customExerciseNames: [...(curUser.customExerciseNames ?? []), value],
      });
    },
    [curUser],
  );

  const addCustomExerciseApparatus = useCallback(
    async (value: string) => {
      if (
        !curUser ||
        getAllExerciseApparatusOptions()
          .map((o) => o.toLowerCase())
          .includes(value.toLowerCase())
      )
        return;

      await updateUser({
        ...curUser,
        customExerciseApparatuses: [
          ...(curUser.customExerciseApparatuses ?? []),
          value,
        ],
      });
    },
    [curUser],
  );

  const getAvailableExerciseNameOptions = useCallback(
    (curExercise: Exercise, allReservedExercises: Exercise[]) => {
      const unavailableExercises = allReservedExercises.filter(
        (e) =>
          e.name !== curExercise.name || e.apparatus !== curExercise.apparatus,
      );

      return getAllExerciseNameOptions().filter(
        (n) =>
          !unavailableExercises.find(
            (e) => e.name === n && e.apparatus === curExercise.apparatus,
          ),
      );
    },
    [curUser],
  );

  const getAvailableExerciseApparatusOptions = useCallback(
    (curExercise: Exercise, allReservedExercises: Exercise[]) => {
      const unavailableExercises = allReservedExercises.filter(
        (e) =>
          e.name !== curExercise.name || e.apparatus !== curExercise.apparatus,
      );

      return getAllExerciseApparatusOptions().filter(
        (a) =>
          !unavailableExercises.find(
            (e) => e.apparatus === a && e.name === curExercise.name,
          ),
      );
    },
    [curUser],
  );

  return (
    <ExcerciseOptionsContext.Provider
      value={{
        addCustomExerciseName,
        addCustomExerciseApparatus,
        getAllExerciseNameOptions,
        getAvailableExerciseNameOptions,
        getAllExerciseApparatusOptions,
        getAvailableExerciseApparatusOptions,
      }}
    >
      {children}
    </ExcerciseOptionsContext.Provider>
  );
};

export const useExerciseOptions = () => useContext(ExcerciseOptionsContext);
