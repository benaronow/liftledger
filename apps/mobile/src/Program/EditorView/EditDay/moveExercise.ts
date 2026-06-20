import { Exercise } from "@liftledger/shared";

// Workout-added (`addedOn`) exercises are hidden from the program editor, so an
// exercise's position in the visible list differs from its position in the full
// day array whenever an addedOn exercise sits earlier. Mutations must map the
// visible index back to the full-array index before they splice/replace, or they
// land on the wrong exercise — clobbering or deleting the hidden addedOn one.
export const visibleExerciseIndices = (exercises: Exercise[]): number[] =>
  exercises.map((_, i) => i).filter((i) => !exercises[i].addedOn);

export const fullExerciseIndex = (
  exercises: Exercise[],
  visibleIdx: number,
): number => visibleExerciseIndices(exercises)[visibleIdx];

export const moveExercise = (
  exercises: Exercise[],
  visIdx: number,
  direction: "up" | "down",
): Exercise[] => {
  const nonAddonFullIndices = visibleExerciseIndices(exercises);

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
