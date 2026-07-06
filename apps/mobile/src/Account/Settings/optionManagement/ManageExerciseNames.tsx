import { useExerciseOptions } from "@liftledger/api-client";
import { ExerciseNameSelect } from "../../../components/ExerciseNameSelect";
import { ManageOptions } from "./ManageOptions";

export const ManageExerciseNames = () => {
  const { allExerciseNameOptions, deleteExerciseName } = useExerciseOptions();

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
