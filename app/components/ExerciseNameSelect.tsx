import { Exercise } from "@/lib/types";
import { useExerciseOptions } from "../layoutProviders/ExerciseOptionsProvider";
import { useMemo } from "react";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
  curExercise: Exercise;
  reservedExercises: Exercise[];
  onSelect: (value: string) => void;
  label?: string;
  className?: string;
}

export const ExerciseNameSelect = ({
  curExercise,
  reservedExercises,
  onSelect,
  label,
  className,
}: Props) => {
  const {
    addCustomExerciseName,
    getAllExerciseNameOptions,
    getAvailableExerciseNameOptions,
  } = useExerciseOptions();

  const availableNameOptions = useMemo(
    () => getAvailableExerciseNameOptions(curExercise, reservedExercises),
    [getAvailableExerciseNameOptions, curExercise, reservedExercises],
  );

  const unavailableNameOptions = useMemo(
    () =>
      getAllExerciseNameOptions().filter(
        (o) => !availableNameOptions.includes(o),
      ),
    [availableNameOptions, getAllExerciseNameOptions],
  );

  return (
    <SearchableSelect
      label={label}
      value={curExercise.name}
      options={availableNameOptions}
      unavailableOptions={unavailableNameOptions}
      onSelect={onSelect}
      onAddCustom={addCustomExerciseName}
      className={className}
    />
  );
};
