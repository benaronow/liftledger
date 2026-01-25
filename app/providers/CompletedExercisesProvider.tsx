import {
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  ExerciseWithDate,
  Set,
  WeightType,
} from "@/lib/types";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUser } from "./UserProvider";
import api from "@/lib/config";
import { useBlock } from "./BlockProvider";

const COMPLETED_EXERCISES_API_URL = "/api/completedExercises";

interface CompletedExercisesContextType {
  completedExercises: {
    current: Exercise[];
    previous: ExerciseWithDate[];
  };
  completedExercisesLoading: boolean;
  getCompletedExercises: (userId: string) => Promise<void>;
  findLatestOccurrence: <T>(
    checkerFunc: (e: Exercise) => T,
    options: { includeCurrentDay: boolean },
  ) => T | undefined;
  getNewSetsFromLatest: (exercise: Exercise, numSets?: number) => Set[];
  getUpdatedExercise: (
    update: ExerciseName | ExerciseApparatus | WeightType,
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
    previous: ExerciseWithDate[];
  }>({ current: [], previous: [] });
  const [completedExercisesLoading, setCompletedExercisesLoading] =
    useState(false);

  const getCompletedExercises = async (userId: string) => {
    setCompletedExercisesLoading(true);
    const res = await api.get(`${COMPLETED_EXERCISES_API_URL}/${userId}`);
    const result: {
      current: Exercise[];
      previous: ExerciseWithDate[];
    } = res.data;
    if (result) setCompletedExercises(result);
    setCompletedExercisesLoading(false);
  };

  useEffect(() => {
    if (curUser?._id) getCompletedExercises(curUser._id);
  }, [curUser]);

  const findLatestOccurrence = useCallback(
    <T,>(
      checkerFunc: (e: Exercise) => T,
      { includeCurrentDay }: { includeCurrentDay: boolean },
    ): T | undefined => {
      const exercises: ExerciseWithDate[] = [
        ...(includeCurrentDay ? completedExercises.current : []),
        ...completedExercises.previous,
      ];

      for (const exercise of exercises) {
        const result = checkerFunc(exercise);
        if (result) return result;
      }
    },
    [completedExercises, curBlock],
  );

  const getNewSetsFromLatest = useCallback(
    (exercise: Exercise, numSets?: number) => {
      const latestOccurrenceSameGymSets = findLatestOccurrence(
        (e: Exercise) => {
          if (
            e.name === exercise.name &&
            e.apparatus === exercise.apparatus &&
            e.gym === exercise.gym
          )
            return e.sets;
        },
        { includeCurrentDay: false },
      )
        ?.filter((set) => !set.addedOn)
        .map((set) => ({
          ...set,
          completed: false,
          skipped: false,
          note: "",
        }));

      const latestOccurrenceAllGymsSetNum = findLatestOccurrence(
        (e: Exercise) => {
          if (e.name === exercise.name && e.apparatus === exercise.apparatus)
            return e;
        },
        { includeCurrentDay: false },
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
      update: ExerciseName | ExerciseApparatus | WeightType,
      type: "name" | "apparatus" | "weightType",
      exercise: Exercise,
    ) => {
      const newExercise = {
        ...exercise,
        name: type === "name" ? (update as ExerciseName) : exercise.name,
        apparatus:
          type === "apparatus"
            ? (update as ExerciseApparatus)
            : exercise.apparatus,
        weightType:
          type === "weightType" ? (update as WeightType) : exercise.weightType,
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
