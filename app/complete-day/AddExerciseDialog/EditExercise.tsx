import {
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  WeightType,
} from "@/lib/types";
import { Dispatch, SetStateAction, useCallback } from "react";
import { LabeledInput } from "@/app/components/LabeledInput";
import { SearchableSelect } from "@/app/components/SearchableSelect";
import { useCompletedExercises } from "@/app/layoutProviders/CompletedExercisesProvider";
import { useUser } from "@/app/layoutProviders/UserProvider";
import { ExerciseInfoName } from "@/app/edit-block/EditDay/ExerciseInfo";
import { useCompleteDay } from "../CompleteDayProvider";

interface Props {
  newExercise: Exercise;
  setNewExercise: Dispatch<SetStateAction<Exercise>>;
}

export const EditExercise = ({ newExercise, setNewExercise }: Props) => {
  const { exercises } = useCompleteDay();
  const { getUpdatedExercise } = useCompletedExercises();
  const {
    addCustomExerciseName,
    addCustomExerciseApparatus,
    getFilteredExerciseOptions,
  } = useUser();

  const switchExercise = useCallback(
    (value: string, type: ExerciseInfoName) => {
      const updatedExercise = getUpdatedExercise(
        value as ExerciseName | ExerciseApparatus | WeightType,
        type,
        newExercise,
      );

      setNewExercise(updatedExercise);
    },
    [getUpdatedExercise, newExercise, setNewExercise],
  );

  return (
    <>
      <SearchableSelect
        label="Exercise:"
        value={newExercise.name}
        options={getFilteredExerciseOptions(newExercise, exercises, "name")}
        onSelect={(value) => switchExercise(value, "name")}
        onAddCustom={addCustomExerciseName}
        className="mb-2"
      />
      <SearchableSelect
        label="Apparatus:"
        value={newExercise.apparatus}
        options={getFilteredExerciseOptions(
          newExercise,
          exercises,
          "apparatus",
        )}
        onSelect={(value) => switchExercise(value, "apparatus")}
        onAddCustom={addCustomExerciseApparatus}
        className="mb-2"
      />
      <LabeledInput
        label="Weight Type:"
        textValue={newExercise.weightType}
        options={Object.values(WeightType)}
        includeEmptyOption
        onChangeSelect={(e) => switchExercise(e.target.value, "weightType")}
        className="mb-1"
      />
    </>
  );
};
