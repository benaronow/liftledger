import {
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  WeightType,
} from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { ChangeExerciseType } from ".";
import { getNewSetsFromLast } from "@/app/utils";
import { useBlock } from "@/app/providers/BlockProvider";
import { LabeledInput } from "@/app/components/LabeledInput";

interface Props {
  exerciseState: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise>>;
  editingType: ChangeExerciseType | "";
  setEditingType: Dispatch<SetStateAction<ChangeExerciseType | "">>;
  takenExercises: Exercise[];
}

export const EditExercise = ({
  exerciseState,
  setExerciseState,
  takenExercises,
}: Props) => {
  const { curBlock } = useBlock();

  const exerciseInfoMap = [
    {
      name: "name",
      title: "Exercise:",
      value: exerciseState.name || "Select",
      options: Object.values(ExerciseName).filter(
        (o) =>
          !takenExercises.find(
            (e) => e.name === o && e.apparatus === exerciseState.apparatus
          )
      ),
    },
    {
      name: "apparatus",
      title: "Apparatus:",
      value: exerciseState.apparatus || "Select",
      options: Object.values(ExerciseApparatus).filter(
        (o) =>
          !takenExercises.find(
            (e) => e.apparatus === o && e.name === exerciseState.name
          )
      ),
    },
    {
      name: "weightType",
      title: "Weight Type:",
      value: exerciseState.weightType || "Select",
      options: Object.values(WeightType),
    },
  ];

  const handleExerciseChange = (
    e: ExerciseName | ExerciseApparatus | WeightType | "",
    type: ChangeExerciseType
  ) => {
    const newExercise = {
      name: type === "name" ? (e as ExerciseName) : exerciseState.name,
      apparatus:
        type === "apparatus"
          ? (e as ExerciseApparatus)
          : exerciseState.apparatus,
      weightType:
        type === "weightType" ? (e as WeightType) : exerciseState.weightType,
      sets: [],
    };

    setExerciseState({
      ...newExercise,
      sets: getNewSetsFromLast(curBlock, newExercise),
    });
  };

  return (
    <>
      {exerciseInfoMap.map((exerciseInfo) => (
        <LabeledInput
          key={exerciseInfo.name}
          label={exerciseInfo.title}
          textValue={exerciseInfo.value}
          options={exerciseInfo.options}
          onChangeSelect={(e) =>
            handleExerciseChange(e.target.value as ExerciseName, "name")
          }
        />
      ))}
    </>
  );
};
