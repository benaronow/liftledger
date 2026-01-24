import {
  Block,
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  ExerciseWithDate,
  Set,
  WeightType,
} from "@/lib/types";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUser } from "./UserProvider";
import api from "@/lib/config";

const BLOCK_API_URL = "/api/block";
const COMPLETED_EXERCISES_API_URL = "/api/completedExercises";

export const EMPTY_BLOCK: Block = {
  name: "",
  startDate: new Date(),
  length: 0,
  weeks: [
    [
      {
        name: "Day 1",
        exercises: [
          {
            name: "",
            apparatus: "",
            sets: [
              {
                reps: 0,
                weight: 0,
                completed: false,
                note: "",
              },
            ],
            weightType: "",
          },
        ],
        completedDate: undefined,
      },
    ],
  ],
  curDayIdx: 0,
  curWeekIdx: 0,
};

interface BlockContextType {
  curBlock?: Block;
  curBlockLoading: boolean;
  completedExercises?: {
    current: Exercise[];
    previous: ExerciseWithDate[];
  };
  completedExercisesLoading: boolean;
  templateBlock: Block;
  setTemplateBlock: Dispatch<SetStateAction<Block>>;
  unsetTemplateBlock: () => void;
  editingWeekIdx: number;
  setEditingWeekIdx: Dispatch<SetStateAction<number>>;
  createBlock: (block: Block) => Promise<void>;
  updateBlock: (block: Block) => Promise<void>;
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

const defaultBlockContext: BlockContextType = {
  curBlockLoading: true,
  completedExercisesLoading: false,
  templateBlock: EMPTY_BLOCK,
  setTemplateBlock: () => {},
  unsetTemplateBlock: () => {},
  editingWeekIdx: 0,
  setEditingWeekIdx: () => {},
  createBlock: async () => {},
  updateBlock: async () => {},
  findLatestOccurrence: () => undefined,
  getNewSetsFromLatest: () => [],
  getUpdatedExercise: () => ({}) as Exercise,
};

export const BlockContext = createContext(defaultBlockContext);

export const BlockProvider = ({ children }: PropsWithChildren<object>) => {
  const { session, curUser, getUser } = useUser();
  const [curBlock, setCurBlock] = useState<Block>();
  const [curBlockLoading, setCurBlockLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<{
    current: Exercise[];
    previous: ExerciseWithDate[];
  }>({ current: [], previous: [] });
  const [completedExercisesLoading, setCompletedExercisesLoading] =
    useState(false);
  const [templateBlock, setTemplateBlock] = useState<Block>(EMPTY_BLOCK);
  const [editingWeekIdx, setEditingWeekIdx] = useState(0);

  const unsetTemplateBlock = () => {
    setTemplateBlock(EMPTY_BLOCK);
  };

  const getCurBlock = async () => {
    setCurBlockLoading(true);
    if (!curUser || !curUser.curBlock) {
      setCurBlockLoading(false);
      return;
    }
    const res = await api.get(`${BLOCK_API_URL}/${curUser.curBlock}`);
    const result: Block = res.data;
    setCurBlock(result);
    setCurBlockLoading(false);
  };

  useEffect(() => {
    getCurBlock();
  }, [curUser?._id]);

  const createBlock = async (block: Block) => {
    if (!curUser || !curUser._id) return;
    const res = await api.post(`${BLOCK_API_URL}`, {
      uid: curUser._id,
      block,
    });
    const result: Block = res.data;
    setCurBlock(result);
  };

  const updateBlock = async (block: Block) => {
    if (!curUser || !curUser._id) return;
    const res = await api.put(`${BLOCK_API_URL}/${block._id}`, {
      uid: curUser._id,
      block,
      completedExercises: completedExercises.previous,
    });
    const result: { block: Block; done: boolean } = res.data;
    if (result.done) {
      setCurBlock(undefined);
      getUser(session?.user.email || "");
    } else {
      setCurBlock(result.block);
    }
  };

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
  }, [curUser, curBlock]);

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
    <BlockContext.Provider
      value={{
        curBlock,
        curBlockLoading,
        completedExercises,
        completedExercisesLoading,
        templateBlock,
        setTemplateBlock,
        unsetTemplateBlock,
        editingWeekIdx,
        setEditingWeekIdx,
        createBlock,
        updateBlock,
        findLatestOccurrence,
        getNewSetsFromLatest,
        getUpdatedExercise,
      }}
    >
      {children}
    </BlockContext.Provider>
  );
};

export const useBlock = () => useContext(BlockContext);
