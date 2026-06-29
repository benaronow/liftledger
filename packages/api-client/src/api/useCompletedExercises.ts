import useSWR, { SWRConfiguration } from "swr";
import type { CompletedExercise, Exercise, Set } from "@liftledger/shared";
import { fetcher } from "../fetcher";

export const completedExercisesKey = (userId: string | undefined | null) =>
  userId ? `/users/${userId}/completedExercises` : null;

export interface CompletedExercisesResponse {
  current: Exercise[];
  previous: CompletedExercise[];
}

const EMPTY: CompletedExercisesResponse = { current: [], previous: [] };

export const useCompletedExercises = (
  userId: string | undefined | null,
  config?: SWRConfiguration<CompletedExercisesResponse>,
) =>
  useSWR<CompletedExercisesResponse>(
    completedExercisesKey(userId),
    fetcher,
    config,
  );

export const findLatestOccurrence = (
  completedExercises: CompletedExercisesResponse | undefined,
  checkerFunc: (e: Exercise) => boolean,
  options?: { includeCurrentSession: boolean },
): CompletedExercise | undefined => {
  const data = completedExercises ?? EMPTY;
  const exercises: CompletedExercise[] = [
    ...(options?.includeCurrentSession ? data.current : []),
    ...data.previous,
  ];

  for (const exercise of exercises) {
    if (checkerFunc(exercise)) return exercise;
  }
  return undefined;
};

export const getNewSetsFromLatest = (
  completedExercises: CompletedExercisesResponse | undefined,
  exercise: Exercise,
  numSets?: number,
): Set[] => {
  const latestOccurrenceSameGymSets = findLatestOccurrence(
    completedExercises,
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
    completedExercises,
    (e: Exercise) =>
      e.name === exercise.name && e.apparatus === exercise.apparatus,
  )?.sets.filter((set) => !set.addedOn).length;

  const sets: Set[] =
    latestOccurrenceSameGymSets ??
    Array(latestOccurrenceAllGymsSetNum).fill({
      reps: null,
      weight: null,
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
};

export const getUpdatedExercise = (
  completedExercises: CompletedExercisesResponse | undefined,
  update: string,
  type: "name" | "apparatus" | "weightType",
  exercise: Exercise,
): Exercise => {
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
        : getNewSetsFromLatest(completedExercises, newExercise),
  };
};
