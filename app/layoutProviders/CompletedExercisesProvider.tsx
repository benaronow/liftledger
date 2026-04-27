"use client";

import { Exercise, CompletedExercise, Set } from "@/lib/types";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { USER_API_URL, useUser } from "./UserProvider";
import api from "@/lib/config";
import { useBlock } from "./BlockProvider";

interface CompletedExercisesContextType {
  completedExercises: {
    current: Exercise[];
    previous: CompletedExercise[];
  };
  completedExercisesLoading: boolean;
  getCompletedExercises: (userId: string) => Promise<void>;
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

const defaultCompletedExercisesContext: CompletedExercisesContextType = {
  completedExercises: { current: [], previous: [] },
  completedExercisesLoading: false,
  getCompletedExercises: async () => {},
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
  const { curBlock } = useBlock();
  const [completedExercises, setCompletedExercises] = useState<{
    current: Exercise[];
    previous: CompletedExercise[];
  }>({ current: [], previous: [] });
  const [completedExercisesLoading, setCompletedExercisesLoading] =
    useState(false);

  const getCompletedExercises = async (userId: string) => {
    setCompletedExercisesLoading(true);
    const res = await api.get(`${USER_API_URL}/${userId}/completedExercises`);
    const result: {
      current: Exercise[];
      previous: CompletedExercise[];
    } = res.data;
    if (result) setCompletedExercises(result);
    setCompletedExercisesLoading(false);
  };

  useEffect(() => {
    if (curUser?._id) getCompletedExercises(curUser._id);
  }, [curUser]);

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
    [completedExercises, curBlock],
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
        getCompletedExercises,
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
