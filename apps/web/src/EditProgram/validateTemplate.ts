import { Program } from "@liftledger/shared";

export const validateTemplate = (
  program: Program,
  editingWeekIdx: number,
): string[] => {
  const errors: string[] = [];
  if (!program.name) errors.push("Program name missing");
  if (program.length === 0) errors.push("Program length too short");
  if (!program.primaryGym) errors.push("Primary gym missing");
  for (const day of program.weeks[editingWeekIdx]) {
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
};
