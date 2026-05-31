import { Exercise } from "@/lib/types";
import { Dispatch, SetStateAction, useCallback } from "react";
import {
  getUpdatedExercise,
  useCompletedExercises,
  useMe,
} from "@liftledger/api-client";
import { ExerciseInfoName } from "@/app/edit-block/EditDay/ExerciseInfo";
import { useCompleteDay } from "../CompleteDayProvider";
import { WEIGHT_TYPES } from "@/lib/weightTypes";
import { ExerciseNameSelect } from "@/app/components/ExerciseNameSelect";
import { ExerciseApparatusSelect } from "@/app/components/ExerciseApparatusSelect";
import { LabeledSelect } from "@/app/components/inputs";

interface Props {
  newExercise: Exercise;
  setNewExercise: Dispatch<SetStateAction<Exercise>>;
}

export const EditExercise = ({ newExercise, setNewExercise }: Props) => {
  const { exercises } = useCompleteDay();
  const { data: curUser } = useMe();
  const { data: completedExercises } = useCompletedExercises(curUser?._id);

  const switchExercise = useCallback(
    (value: string, type: ExerciseInfoName) => {
      const updatedExercise = getUpdatedExercise(
        completedExercises,
        value,
        type,
        newExercise,
      );

      setNewExercise(updatedExercise);
    },
    [completedExercises, newExercise, setNewExercise],
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
      <LabeledSelect
        label="Weight Type:"
        value={newExercise.weightType}
        options={WEIGHT_TYPES}
        includeEmptyOption
        onChange={(e) => switchExercise(e.target.value, "weightType")}
        className="mb-1"
      />
    </>
  );
};
