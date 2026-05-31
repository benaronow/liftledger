import { Exercise } from "@/lib/types";

export const computeProgress = (
  setIdx: number,
  exercise: Exercise,
  history: Exercise[],
): number | undefined => {
  let prevWeight: number | undefined;
  let prevReps: number | undefined;

  for (const e of history) {
    if (
      e.name === exercise.name &&
      e.apparatus === exercise.apparatus &&
      e.gym === exercise.gym &&
      e.sets[setIdx]?.completed
    ) {
      prevWeight = e.sets[setIdx].weight;
      prevReps = e.sets[setIdx].reps;
      break;
    }
  }

  if (prevWeight === undefined || prevReps === undefined) return undefined;

  const cur = exercise.sets[setIdx];
  const weightDiff = cur ? cur.weight - prevWeight : 0;
  const repDiff = cur ? cur.reps - prevReps : 0;

  if (weightDiff > 0 || (repDiff > 0 && weightDiff === 0)) return 1;
  if (weightDiff < 0 || (repDiff < 0 && weightDiff === 0)) return -1;
  return 0;
};
