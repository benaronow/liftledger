import { Exercise, ExerciseApparatus, ExerciseName } from "@/lib/types";

export const getAvailableOptions = (
  curExercise: Exercise,
  exercises: Exercise[],
  type: "name" | "apparatus",
) => {
  const takenExercises = exercises.filter(
    (e) =>
      !(e.name === curExercise.name && e.apparatus === curExercise.apparatus),
  );

  return Object.values(
    type === "name" ? ExerciseName : ExerciseApparatus,
  ).filter(
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
