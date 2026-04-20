import { Exercise } from "@/lib/types";
import { Dispatch, SetStateAction, useCallback } from "react";
import { LabeledInput } from "@/app/components/LabeledInput";
import { useCompletedExercises } from "@/app/layoutProviders/CompletedExercisesProvider";
import { ExerciseInfoName } from "@/app/edit-block/EditDay/ExerciseInfo";
import { useCompleteDay } from "../CompleteDayProvider";
import { WEIGHT_TYPES } from "@/lib/weightTypes";
import { ExerciseNameSelect } from "@/app/components/ExerciseNameSelect";
import { ExerciseApparatusSelect } from "@/app/components/ExerciseApparatusSelect";

interface Props {
  newExercise: Exercise;
  setNewExercise: Dispatch<SetStateAction<Exercise>>;
}

export const EditExercise = ({ newExercise, setNewExercise }: Props) => {
  const { exercises } = useCompleteDay();
  const { getUpdatedExercise } = useCompletedExercises();

  const switchExercise = useCallback(
    (value: string, type: ExerciseInfoName) => {
      const updatedExercise = getUpdatedExercise(value, type, newExercise);

      setNewExercise(updatedExercise);
    },
    [getUpdatedExercise, newExercise, setNewExercise],
  );

  return (
    <>
      <ExerciseNameSelect
        label="Exercise:"
        curExercise={newExercise}
        reservedExercises={exercises}
        onSelect={(value) => switchExercise(value, "name")}
        className="mb-2"
      />
      <ExerciseApparatusSelect
        label="Apparatus:"
        curExercise={newExercise}
        reservedExercises={exercises}
        onSelect={(value) => switchExercise(value, "apparatus")}
        className="mb-2"
      />
      <LabeledInput
        label="Weight Type:"
        textValue={newExercise.weightType}
        options={WEIGHT_TYPES}
        includeEmptyOption
        onChangeSelect={(e) => switchExercise(e.target.value, "weightType")}
        className="mb-1"
      />
    </>
  );
};
