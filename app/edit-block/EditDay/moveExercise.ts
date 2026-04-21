import { Exercise } from "@/lib/types";

export const moveExercise = (
  exercises: Exercise[],
  visIdx: number,
  direction: "up" | "down",
): Exercise[] => {
  const nonAddonFullIndices = exercises
    .map((_, i) => i)
    .filter((i) => !exercises[i].addedOn);

  const groupEnd = (fullIdx: number): number => {
    const next = nonAddonFullIndices.find((i) => i > fullIdx);
    return next !== undefined ? next - 1 : exercises.length - 1;
  };

  const lowerVisIdx = direction === "up" ? visIdx - 1 : visIdx;
  const upperVisIdx = direction === "up" ? visIdx : visIdx + 1;

  const lowerFullIdx = nonAddonFullIndices[lowerVisIdx];
  const upperFullIdx = nonAddonFullIndices[upperVisIdx];
  const lowerEnd = groupEnd(lowerFullIdx);
  const upperEnd = groupEnd(upperFullIdx);

  return [
    ...exercises.slice(0, lowerFullIdx),
    ...exercises.slice(upperFullIdx, upperEnd + 1),
    ...exercises.slice(lowerEnd + 1, upperFullIdx),
    ...exercises.slice(lowerFullIdx, lowerEnd + 1),
    ...exercises.slice(upperEnd + 1),
  ];
};
