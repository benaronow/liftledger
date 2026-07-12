import {
  useOptions,
  useAddOption,
  useRenameOption,
  useRemoveOption,
} from "./options";

export const useExerciseNameOptions = () => useOptions("exerciseNames");
export const useAddExerciseName = () => useAddOption("exerciseNames");
export const useRenameExerciseName = () => useRenameOption("exerciseNames");
export const useRemoveExerciseName = () => useRemoveOption("exerciseNames");
