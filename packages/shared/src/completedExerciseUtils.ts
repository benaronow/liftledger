import type { CompletedExercise, Exercise, Set } from "./types";

export interface CompletedExercisesResponse {
  current: Exercise[];
  previous: CompletedExercise[];
}

const EMPTY: CompletedExercisesResponse = { current: [], previous: [] };

const BLANK_SET: Set = {
  reps: null,
  weight: null,
  note: "",
  completed: false,
};

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
      dropSets: undefined,
    }));

  const latestOccurrenceAllGymsSetNum = findLatestOccurrence(
    completedExercises,
    (e: Exercise) =>
      e.name === exercise.name && e.equipment === exercise.equipment,
  )?.workingSets.filter((set) => !set.addedOn).length;

  const sets: Set[] =
    latestOccurrenceSameGymSets ??
    Array(latestOccurrenceAllGymsSetNum).fill(BLANK_SET);

  if (numSets !== undefined)
    return numSets < sets.length
      ? sets.slice(0, numSets)
      : sets.concat(
          Array<Set>(numSets - sets.length).fill(
            sets[sets.length - 1] ?? BLANK_SET,
          ),
        );

  return sets;
};

export const getNewWarmupSetsFromLatest = (
  completedExercises: CompletedExercisesResponse | undefined,
  exercise: Exercise,
  numSets?: number,
): Set[] => {
  const latestOccurrenceSameGymSets = findLatestOccurrence(
    completedExercises,
    (e: Exercise) =>
      e.name === exercise.name &&
      e.equipment === exercise.equipment &&
      e.gym === exercise.gym &&
      !!e.warmupSets?.length,
  )
    ?.warmupSets?.filter((set) => !set.addedOn)
    .map((set) => ({
      ...set,
      completed: false,
      skipped: false,
      note: "",
    }));

  // No warmup history for this gym means no warmups, mirroring how working sets
  // fall back to a fixed count. When numSets is passed (the editor count input)
  // it governs, so this only applies on name/equipment change.
  const sets: Set[] =
    latestOccurrenceSameGymSets ?? Array<Set>(numSets ?? 0).fill(BLANK_SET);

  if (numSets !== undefined)
    return numSets < sets.length
      ? sets.slice(0, numSets)
      : sets.concat(
          Array<Set>(numSets - sets.length).fill(
            sets[sets.length - 1] ?? BLANK_SET,
          ),
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
    warmupSets:
      type === "unit"
        ? newExercise.warmupSets
        : getNewWarmupSetsFromLatest(completedExercises, newExercise),
  };
};
