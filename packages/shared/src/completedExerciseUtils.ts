import type { CompletedExercise, Exercise, Set } from "./types";

export interface CompletedExercisesResponse {
  current: Exercise[];
  previous: CompletedExercise[];
}

const EMPTY: CompletedExercisesResponse = { current: [], previous: [] };

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
      e.equipment === exercise.equipment &&
      e.gym === exercise.gym,
  )
    ?.workingSets?.filter((set) => !set.addedOn)
    .map((set) => ({
      ...set,
      completed: false,
      skipped: false,
      note: "",
    }));

  const latestOccurrenceAllGymsSetNum = findLatestOccurrence(
    completedExercises,
    (e: Exercise) =>
      e.name === exercise.name && e.equipment === exercise.equipment,
  )?.workingSets.filter((set) => !set.addedOn).length;

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
  type: "name" | "equipment" | "unit",
  exercise: Exercise,
): Exercise => {
  const newExercise = {
    ...exercise,
    name: type === "name" ? update : exercise.name,
    equipment: type === "equipment" ? update : exercise.equipment,
    unit: type === "unit" ? update : exercise.unit,
  };

  return {
    ...newExercise,
    workingSets:
      type === "unit"
        ? newExercise.workingSets
        : getNewSetsFromLatest(completedExercises, newExercise),
  };
};
