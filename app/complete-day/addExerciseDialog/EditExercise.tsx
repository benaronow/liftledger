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

interface Props {
  exerciseState: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise>>;
  exercisesState: Exercise[];
}

export type ExerciseInfoName = "name" | "apparatus" | "weightType";

export const EditExercise = ({
  exerciseState,
  setExerciseState,
  exercisesState,
}: Props) => {
  const { getUpdatedExercise } = useCompletedExercises();
  const { curUser, addCustomExercise, addCustomApparatus } = useUser();

  const switchExercise = useCallback(
    (value: string, type: ExerciseInfoName) => {
      const updatedExercise = getUpdatedExercise(
        value as ExerciseName | ExerciseApparatus | WeightType,
        type,
        exerciseState,
      );

      setExerciseState(updatedExercise);
    },
    [getUpdatedExercise, exerciseState, setExerciseState],
  );

  return (
    <>
      <SearchableSelect
        label="Exercise:"
        value={exerciseState.name}
        options={getAvailableOptions(
          exerciseState,
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
        value={exerciseState.apparatus}
        options={getAvailableOptions(
          exerciseState,
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
        textValue={exerciseState.weightType}
        options={Object.values(WeightType)}
        includeEmptyOption
        onChangeSelect={(e) => switchExercise(e.target.value, "weightType")}
        className="mb-1"
      />
    </>
  );
};
