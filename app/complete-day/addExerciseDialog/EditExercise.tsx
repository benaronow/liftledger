import { Exercise, WeightType } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { getAvailableOptions, switchExercise } from "@/lib/blockUtils";
import { useBlock } from "@/app/providers/BlockProvider";
import { LabeledInput } from "@/app/components/LabeledInput";

interface Props {
  exerciseState: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise>>;
  exercisesState: Exercise[];
}

export const EditExercise = ({
  exerciseState,
  setExerciseState,
  exercisesState,
}: Props) => {
  const { curBlock } = useBlock();

  const exerciseInfoMap = [
    {
      name: "name",
      title: "Exercise:",
      value: exerciseState.name,
      options: getAvailableOptions(exerciseState, exercisesState, "name"),
    },
    {
      name: "apparatus",
      title: "Apparatus:",
      value: exerciseState.apparatus,
      options: getAvailableOptions(exerciseState, exercisesState, "apparatus"),
    },
    {
      name: "weightType",
      title: "Weight Type:",
      value: exerciseState.weightType,
      options: Object.values(WeightType),
    },
  ];

  return (
    <>
      {exerciseInfoMap.map((exerciseInfo, i) => (
        <LabeledInput
          key={exerciseInfo.name}
          label={exerciseInfo.title}
          textValue={exerciseInfo.value}
          options={exerciseInfo.options}
          onChangeSelect={(e) =>
            switchExercise(
              e,
              exerciseInfo.name as "name" | "apparatus" | "weightType",
              curBlock,
              exerciseState,
              setExerciseState
            )
          }
          className={i !== exerciseInfoMap.length - 1 ? "mb-2" : "mb-1"}
        />
      ))}
    </>
  );
};
