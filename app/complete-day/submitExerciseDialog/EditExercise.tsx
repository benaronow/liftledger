import {
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  WeightType,
} from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { ChangeExerciseType } from ".";
import { getNewSetsFromLatest } from "@/lib/blockUtils";
import { useBlock } from "@/app/providers/BlockProvider";
import { LabeledInput } from "@/app/components/LabeledInput";

interface Props {
  exerciseState: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise>>;
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
      value: exerciseState.name,
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
      value: exerciseState.apparatus,
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
      value: exerciseState.weightType,
      options: Object.values(WeightType),
    },
  ];

  const handleExerciseChange = (
    e: ExerciseName | ExerciseApparatus | WeightType | "",
    type: ChangeExerciseType
  ) => {
    const newExercise = {
      ...exerciseState,
      name: type === "name" ? (e as ExerciseName) : exerciseState.name,
      apparatus:
        type === "apparatus"
          ? (e as ExerciseApparatus)
          : exerciseState.apparatus,
      weightType:
        type === "weightType" ? (e as WeightType) : exerciseState.weightType,
    };

    setExerciseState({
      ...newExercise,
      sets: getNewSetsFromLatest(curBlock, newExercise),
    });
  };

  return (
    <>
      {exerciseInfoMap.map((exerciseInfo, i) => (
        <LabeledInput
          key={exerciseInfo.name}
          label={exerciseInfo.title}
          textValue={exerciseInfo.value}
          options={exerciseInfo.options}
          onChangeSelect={(e) => {
            switch (exerciseInfo.name) {
              case "name":
                return handleExerciseChange(
                  e.target.value as ExerciseName,
                  "name"
                );
              case "apparatus":
                return handleExerciseChange(
                  e.target.value as ExerciseApparatus,
                  "apparatus"
                );
              case "weightType":
                return handleExerciseChange(
                  e.target.value as WeightType,
                  "weightType"
                );
              default:
                return undefined;
            }
          }}
          className={i !== exerciseInfoMap.length - 1 ? "mb-2" : "mb-1"}
        />
      ))}
    </>
  );
};
