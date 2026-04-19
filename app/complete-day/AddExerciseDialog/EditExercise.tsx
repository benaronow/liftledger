import {
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  WeightType,
} from "@/lib/types";
import { Dispatch, SetStateAction, useCallback } from "react";
import { getAvailableOptions } from "@/lib/blockUtils";
import { LabeledInput } from "@/app/components/LabeledInput";
import { SearchableSelect } from "@/app/components/SearchableSelect";
import { useCompletedExercises } from "@/app/providers/CompletedExercisesProvider";
import { useUser } from "@/app/providers/UserProvider";
import { ExerciseInfoName } from "@/app/edit-block/EditDay/ExerciseInfo";

interface Props {
  newExercise: Exercise;
  setNewExercise: Dispatch<SetStateAction<Exercise>>;
  exercisesState: Exercise[];
}

export const EditExercise = ({
  newExercise,
  setNewExercise,
  exercisesState,
}: Props) => {
  const { getUpdatedExercise } = useCompletedExercises();
  const { curUser, addCustomExercise, addCustomApparatus } = useUser();

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
        options={getAvailableOptions(
          newExercise,
          exercisesState,
          "name",
          curUser?.customExercises,
        )}
        onSelect={(value) => switchExercise(value, "name")}
        onAddCustom={addCustomExercise}
        className="mb-2"
      />
      <SearchableSelect
        label="Apparatus:"
        value={newExercise.apparatus}
        options={getAvailableOptions(
          newExercise,
          exercisesState,
          "apparatus",
          curUser?.customApparatuses,
        )}
        onSelect={(value) => switchExercise(value, "apparatus")}
        onAddCustom={addCustomApparatus}
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
