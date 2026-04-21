import { Block } from "@/lib/types";

export const validateTemplate = (
  block: Block,
  editingWeekIdx: number,
): string[] => {
  const errors: string[] = [];
  if (!block.name) errors.push("Block name missing");
  if (block.length === 0) errors.push("Block length too short");
  if (!block.primaryGym) errors.push("Primary gym missing");
  for (const day of block.weeks[editingWeekIdx]) {
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
