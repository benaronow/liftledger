import {
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  WeightType,
} from "@/lib/types";
import { Dispatch, SetStateAction, useCallback } from "react";
import { getAvailableOptions } from "@/lib/blockUtils";
import { LabeledInput } from "@/app/components/LabeledInput";
import { useCompletedExercises } from "@/app/providers/CompletedExercisesProvider";

interface Props {
  exerciseState: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise>>;
  exercisesState: Exercise[];
}

export type ExerciseInfoName = "name" | "apparatus" | "weightType";
interface ExerciseInfo {
  name: ExerciseInfoName;
  title: string;
  value: ExerciseName | ExerciseApparatus | WeightType;
  options: (string | WeightType)[];
}

export const EditExercise = ({
  exerciseState,
  setExerciseState,
  exercisesState,
}: Props) => {
  const { getUpdatedExercise } = useCompletedExercises();

  const exerciseInfoMap: ExerciseInfo[] = [
    {
      name: "name",
      title: "Exercise:",
      value: exerciseState.name as ExerciseName,
      options: getAvailableOptions(exerciseState, exercisesState, "name"),
    },
    {
      name: "apparatus",
      title: "Apparatus:",
      value: exerciseState.apparatus as ExerciseApparatus,
      options: getAvailableOptions(exerciseState, exercisesState, "apparatus"),
    },
    {
      name: "weightType",
      title: "Weight Type:",
      value: exerciseState.weightType as WeightType,
      options: Object.values(WeightType),
    },
  ];

  const switchExercise = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>, type: ExerciseInfoName) => {
      const updatedExercise = getUpdatedExercise(
        e.target.value as ExerciseName | ExerciseApparatus | WeightType,
        type,
        exerciseState,
      );

      setExerciseState(updatedExercise);
    },
    [getUpdatedExercise, exerciseState, setExerciseState],
  );

  return (
    <>
      {exerciseInfoMap.map((exerciseInfo, i) => (
        <LabeledInput
          key={exerciseInfo.name}
          label={exerciseInfo.title}
          textValue={exerciseInfo.value}
          options={exerciseInfo.options}
          includeEmptyOption
          onChangeSelect={(e) => switchExercise(e, exerciseInfo.name)}
          className={i !== exerciseInfoMap.length - 1 ? "mb-2" : "mb-1"}
        />
      ))}
    </>
  );
};
