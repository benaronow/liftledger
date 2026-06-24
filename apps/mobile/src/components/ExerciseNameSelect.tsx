import { Exercise } from "@liftledger/shared";
import { useExerciseOptions } from "@liftledger/api-client";
import { useMemo } from "react";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
  curExercise: Exercise;
  reservedExercises: Exercise[];
  onSelect: (value: string) => void;
  label?: string;
}

export const ExerciseNameSelect = ({
  curExercise,
  reservedExercises,
  onSelect,
  label,
}: Props) => {
  const {
    addCustomExerciseName,
    allExerciseNameOptions,
    getAvailableExerciseNameOptions,
  } = useExerciseOptions();

  const availableNameOptions = useMemo(
    () => getAvailableExerciseNameOptions(curExercise, reservedExercises),
    [getAvailableExerciseNameOptions, curExercise, reservedExercises],
  );

  const unavailableNameOptions = useMemo(
    () =>
      allExerciseNameOptions.filter((o) => !availableNameOptions.includes(o)),
    [availableNameOptions, allExerciseNameOptions],
  );

  return (
    <SearchableSelect
      label={label}
      value={curExercise.name}
      options={availableNameOptions}
      unavailableOptions={unavailableNameOptions}
      onSelect={onSelect}
      onAddCustom={addCustomExerciseName}
      canAddCustom
      placeholder="Enter or add an exercise..."
    />
  );
};
