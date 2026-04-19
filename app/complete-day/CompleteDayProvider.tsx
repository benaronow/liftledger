"use client";

import { Exercise, Set } from "@/lib/types";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import { useBlock } from "../providers/BlockProvider";

export interface ExerciseToEdit {
  setIdx: number;
  exercise: Exercise;
}

interface CompleteDayContextModel {
  exercises: Exercise[];
  exerciseToEdit?: ExerciseToEdit;
  setExerciseToEdit: Dispatch<SetStateAction<ExerciseToEdit | undefined>>;
  addExerciseIdx?: number;
  setAddExerciseIdx: Dispatch<SetStateAction<number | undefined>>;
  deletingIdx?: number;
  setDeletingIdx: Dispatch<SetStateAction<number | undefined>>;
  editing: boolean;
  setEditing: Dispatch<SetStateAction<boolean>>;
  editGymDialogOpen: boolean;
  setEditGymDialogOpen: Dispatch<SetStateAction<boolean>>;
  isExerciseComplete: (exercise: Exercise) => boolean;
  currentExIdx: number;
  isDayStarted: boolean;
  isDayComplete: boolean;
}

const defaultCompleteDayContext: CompleteDayContextModel = {
  exercises: [],
  setExerciseToEdit: () => {},
  setAddExerciseIdx: () => {},
  setDeletingIdx: () => {},
  editing: false,
  setEditing: () => {},
  editGymDialogOpen: false,
  setEditGymDialogOpen: () => {},
  isExerciseComplete: (exercise: Exercise) => !!exercise,
  currentExIdx: 0,
  isDayStarted: false,
  isDayComplete: false,
};

const CompleteDayContext = createContext<CompleteDayContextModel>(
  defaultCompleteDayContext,
);

export const CompleteDayProvider = ({ children }: PropsWithChildren) => {
  const { curBlock } = useBlock();
  const [exerciseToEdit, setExerciseToEdit] = useState<ExerciseToEdit>();
  const [addExerciseIdx, setAddExerciseIdx] = useState<number>();
  const [deletingIdx, setDeletingIdx] = useState<number>();
  const [editing, setEditing] = useState(false);
  const [editGymDialogOpen, setEditGymDialogOpen] = useState(false);

  const exercises = useMemo(
    () =>
      curBlock
        ? curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].exercises
        : [],
    [curBlock],
  );

  const isExerciseComplete = (exercise: Exercise) =>
    exercise.sets.length !== 0 &&
    exercise.sets.reduce(
      (acc: boolean, curSet: Set) =>
        acc && (curSet.completed || (curSet.skipped ?? false)),
      true,
    );

  const currentExIdx = useMemo(
    () => exercises.findIndex((exercise) => !isExerciseComplete(exercise)),
    [exercises],
  );

  const isDayStarted = useMemo(
    () =>
      exercises.some((exercise) =>
        exercise.sets.some((set) => set.completed || set.skipped),
      ),
    [exercises],
  );

  const isDayComplete = useMemo(
    () => exercises.every((exercise: Exercise) => isExerciseComplete(exercise)),
    [exercises],
  );

  return (
    <CompleteDayContext.Provider
      value={{
        exercises,
        exerciseToEdit,
        setExerciseToEdit,
        addExerciseIdx,
        setAddExerciseIdx,
        editing,
        setEditing,
        editGymDialogOpen,
        setEditGymDialogOpen,
        deletingIdx,
        setDeletingIdx,
        isExerciseComplete,
        currentExIdx,
        isDayStarted,
        isDayComplete,
      }}
    >
      {children}
    </CompleteDayContext.Provider>
  );
};

export const useCompleteDay = () => useContext(CompleteDayContext);
