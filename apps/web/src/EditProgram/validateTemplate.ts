import { Program } from "@liftledger/shared";

export const validateTemplate = (
  program: Program,
  editingRotationIdx: number,
): string[] => {
  const errors: string[] = [];
  if (!program.name) errors.push("Program name missing");
  if (program.length === 0) errors.push("Program length too short");
  if (!program.primaryGym) errors.push("Primary gym missing");
  for (const session of program.rotations[editingRotationIdx]) {
    for (const exercise of session.exercises) {
      if (
        !exercise.name ||
        !exercise.apparatus ||
        !exercise.weightType ||
        exercise.sets.length === 0
      )
        errors.push(session.name);
    }
  }
  return errors;
};
