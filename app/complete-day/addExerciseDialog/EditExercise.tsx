import {
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  WeightType,
} from "@/lib/types";
import { ChangeEvent, Dispatch, SetStateAction, useMemo } from "react";
import { getNewSetsFromLatest } from "@/lib/blockUtils";
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

  const takenExercises = useMemo(() => {
      return exercisesState.filter(
        (e) =>
          !(
            e.name === exerciseState.name &&
            e.apparatus === exerciseState.apparatus
          )
      );
    }, [exercisesState, exerciseState]);

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
    e: ChangeEvent<HTMLSelectElement>,
    type: "name" | "apparatus" | "weightType"
  ) => {
    const newExercise = {
      ...exerciseState,
      name:
        type === "name" ? (e.target.value as ExerciseName) : exerciseState.name,
      apparatus:
        type === "apparatus"
          ? (e.target.value as ExerciseApparatus)
          : exerciseState.apparatus,
      weightType:
        type === "weightType"
          ? (e.target.value as WeightType)
          : exerciseState.weightType,
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
                return handleExerciseChange(e, "name");
              case "apparatus":
                return handleExerciseChange(e, "apparatus");
              case "weightType":
                return handleExerciseChange(e, "weightType");
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
