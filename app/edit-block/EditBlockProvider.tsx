"use client";

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

interface EditBlockContextModel {
  editingDayIdx: number;
  setEditingDayIdx: Dispatch<SetStateAction<number>>;
  saveDialogOpen: boolean;
  setSaveDialogOpen: Dispatch<SetStateAction<boolean>>;
  templateErrors: string[];
  deletingDayIdx: number | undefined;
  setDeletingDayIdx: Dispatch<SetStateAction<number | undefined>>;
  deletingExerciseIdx: number | undefined;
  setDeletingExerciseIdx: Dispatch<SetStateAction<number | undefined>>;
}

const defaultEditBlockContext: EditBlockContextModel = {
  editingDayIdx: -1,
  setEditingDayIdx: () => {},
  saveDialogOpen: false,
  setSaveDialogOpen: () => {},
  templateErrors: [],
  deletingDayIdx: undefined,
  setDeletingDayIdx: () => {},
  deletingExerciseIdx: undefined,
  setDeletingExerciseIdx: () => {},
};

const EditBlockContext = createContext<EditBlockContextModel>(
  defaultEditBlockContext,
);

export const EditBlockProvider = ({ children }: PropsWithChildren) => {
  const { templateBlock, editingWeekIdx } = useBlock();
  const [editingDayIdx, setEditingDayIdx] = useState(-1);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deletingDayIdx, setDeletingDayIdx] = useState<number | undefined>(
    undefined,
  );
  const [deletingExerciseIdx, setDeletingExerciseIdx] = useState<
    number | undefined
  >(undefined);

  const templateErrors = useMemo(() => {
    const errors: string[] = [];
    if (!templateBlock.name) errors.push("Block name missing");
    if (templateBlock.length === 0) errors.push("Block length too short");
    if (!templateBlock.primaryGym) errors.push("Primary gym missing");
    for (const day of templateBlock.weeks[editingWeekIdx]) {
      for (const exercise of day.exercises) {
        if (
          !exercise.name ||
          !exercise.apparatus ||
          !exercise.weightType ||
          exercise.sets.length === 0
        )
          errors.push(day.name);
      }
    }
    return errors;
  }, [templateBlock, editingWeekIdx]);

  return (
    <EditBlockContext.Provider
      value={{
        editingDayIdx,
        setEditingDayIdx,
        saveDialogOpen,
        setSaveDialogOpen,
        templateErrors,
        deletingDayIdx,
        setDeletingDayIdx,
        deletingExerciseIdx,
        setDeletingExerciseIdx,
      }}
    >
      {children}
    </EditBlockContext.Provider>
  );
};

export const useEditBlock = () => useContext(EditBlockContext);
