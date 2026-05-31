"use client";

import { Exercise, CompletedExercise, Set } from "@/lib/types";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useUser } from "./UserProvider";
import { useCompletedExercises as useCompletedExercisesQuery } from "@liftledger/api-client";

interface CompletedExercisesContextType {
  completedExercises: {
    current: Exercise[];
    previous: CompletedExercise[];
  };
  completedExercisesLoading: boolean;
  findLatestOccurrence: (
    checkerFunc: (e: Exercise) => boolean,
    options?: { includeCurrentDay: boolean },
  ) => CompletedExercise | undefined;
  getNewSetsFromLatest: (exercise: Exercise, numSets?: number) => Set[];
  getUpdatedExercise: (
    update: string,
    type: "name" | "apparatus" | "weightType",
    exercise: Exercise,
  ) => Exercise;
}

const EMPTY = { current: [], previous: [] };

const defaultCompletedExercisesContext: CompletedExercisesContextType = {
  completedExercises: EMPTY,
  completedExercisesLoading: false,
  findLatestOccurrence: () => undefined,
  getNewSetsFromLatest: () => [],
  getUpdatedExercise: () => ({}) as Exercise,
};

export const CompletedExercisesContext = createContext(
  defaultCompletedExercisesContext,
);

export const CompletedExercisesProvider = ({
  children,
}: PropsWithChildren<object>) => {
  const { curUser } = useUser();
  const { data, isLoading } = useCompletedExercisesQuery(curUser?._id);

  const completedExercises = useMemo(() => data ?? EMPTY, [data]);
  const completedExercisesLoading = !!curUser?._id && isLoading;

  const findLatestOccurrence = useCallback(
    (
      checkerFunc: (e: Exercise) => boolean,
      options?: { includeCurrentDay: boolean },
    ): CompletedExercise | undefined => {
      const exercises: CompletedExercise[] = [
        ...(options?.includeCurrentDay ? completedExercises.current : []),
        ...completedExercises.previous,
      ];

      for (const exercise of exercises) {
        if (checkerFunc(exercise)) return exercise;
      }
    },
    [completedExercises],
  );

  const getNewSetsFromLatest = useCallback(
    (exercise: Exercise, numSets?: number) => {
      const latestOccurrenceSameGymSets = findLatestOccurrence(
        (e: Exercise) =>
          e.name === exercise.name &&
          e.apparatus === exercise.apparatus &&
          e.gym === exercise.gym,
      )
        ?.sets?.filter((set) => !set.addedOn)
        .map((set) => ({
          ...set,
          completed: false,
          skipped: false,
          note: "",
        }));

      const latestOccurrenceAllGymsSetNum = findLatestOccurrence(
        (e: Exercise) =>
          e.name === exercise.name && e.apparatus === exercise.apparatus,
      )?.sets.filter((set) => !set.addedOn).length;

      const sets =
        latestOccurrenceSameGymSets ??
        Array(latestOccurrenceAllGymsSetNum).fill({
          reps: 0,
          weight: 0,
          note: "",
          completed: false,
        });

      if (numSets !== undefined)
        return numSets < sets.length
          ? sets.slice(0, numSets)
          : sets.concat(
              Array<Set>(numSets - sets.length).fill(sets[sets.length - 1]),
            );

      return sets;
    },
    [findLatestOccurrence],
  );

  const getUpdatedExercise = useCallback(
    (
      update: string,
      type: "name" | "apparatus" | "weightType",
      exercise: Exercise,
    ) => {
      const newExercise = {
        ...exercise,
        name: type === "name" ? update : exercise.name,
        apparatus: type === "apparatus" ? update : exercise.apparatus,
        weightType: type === "weightType" ? update : exercise.weightType,
      };

      return {
        ...newExercise,
        sets:
          type === "weightType"
            ? newExercise.sets
            : getNewSetsFromLatest(newExercise),
      };
    },
    [getNewSetsFromLatest],
  );

  return (
    <CompletedExercisesContext.Provider
      value={{
        completedExercises,
        completedExercisesLoading,
        findLatestOccurrence,
        getNewSetsFromLatest,
        getUpdatedExercise,
      }}
    >
      {children}
    </CompletedExercisesContext.Provider>
  );
};

export const useCompletedExercises = () =>
  useContext(CompletedExercisesContext);
