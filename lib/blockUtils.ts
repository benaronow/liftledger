import { Exercise, ExerciseApparatus, ExerciseName } from "@/lib/types";

export const getAvailableOptions = (
  curExercise: Exercise,
  exercises: Exercise[],
  type: "name" | "apparatus",
  customOptions: string[] = [],
) => {
  const takenExercises = exercises.filter(
    (e) =>
      !(e.name === curExercise.name && e.apparatus === curExercise.apparatus),
  );

  const baseOptions = Object.values(
    type === "name" ? ExerciseName : ExerciseApparatus,
  );

  const allOptions = [
    ...baseOptions,
    ...customOptions.filter((c) => !baseOptions.some((b) => b.toLowerCase() === c.toLowerCase())),
  ];

  return allOptions.filter(
    (o) =>
      !takenExercises.find((e) => {
        if (type === "name")
          return e.name === o && e.apparatus === curExercise.apparatus;
        if (type === "apparatus")
          return e.apparatus === o && e.name === curExercise.name;
        return false;
      }),
  );
};
