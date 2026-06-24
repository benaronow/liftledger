import { Exercise } from "@liftledger/shared";
import { useExerciseOptions } from "@liftledger/api-client";
import { useMemo } from "react";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
  curExercise: Exercise;
  reservedExercises: Exercise[];
  onSelect: (value: string) => void;
  label?: string;
  error?: string;
}

export const ExerciseApparatusSelect = ({
  curExercise,
  reservedExercises,
  onSelect,
  label,
  error,
}: Props) => {
  const {
    addCustomExerciseApparatus,
    allExerciseApparatusOptions,
    getAvailableExerciseApparatusOptions,
  } = useExerciseOptions();

  const availableApparatusOptions = useMemo(
    () => getAvailableExerciseApparatusOptions(curExercise, reservedExercises),
    [getAvailableExerciseApparatusOptions, curExercise, reservedExercises],
  );

  const unavailableApparatusOptions = useMemo(
    () =>
      allExerciseApparatusOptions.filter(
        (o) => !availableApparatusOptions.includes(o),
      ),
    [availableApparatusOptions, allExerciseApparatusOptions],
  );

  return (
    <SearchableSelect
      label={label}
      error={error}
      value={curExercise.apparatus}
      options={availableApparatusOptions}
      unavailableOptions={unavailableApparatusOptions}
      onSelect={onSelect}
      onAddCustom={addCustomExerciseApparatus}
      canAddCustom
      placeholder="Enter or add an apparatus..."
    />
  );
};
