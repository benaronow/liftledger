import {
  useExerciseNameOptions,
  useRemoveExerciseName,
} from "@liftledger/api-client";
import { ExerciseNameSelect } from "../../../components/ExerciseNameSelect";
import { ManageOptions } from "./ManageOptions";

export const ManageExerciseNames = () => {
  const { data: allExerciseNameOptions = [] } = useExerciseNameOptions();
  const { send: removeExerciseName } = useRemoveExerciseName();

  const deleteExerciseName = async (value: string) => {
    await removeExerciseName(value);
  };

  return (
    <ManageOptions
      optionType="name"
      buttonLabel="Exercises"
      singular="exercise"
      fieldLabel="Exercise name"
      options={allExerciseNameOptions}
      onDelete={deleteExerciseName}
    >
      {(props) => <ExerciseNameSelect {...props} canAddCustom />}
    </ManageOptions>
  );
};
