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

export const ExerciseApparatusSelect = ({
  curExercise,
  reservedExercises,
  onSelect,
  label,
  className,
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
        (o) =>
          !getAvailableExerciseApparatusOptions(
            curExercise,
            reservedExercises,
          ).includes(o),
      ),
    [availableApparatusOptions, allExerciseApparatusOptions],
  );

  return (
    <SearchableSelect
      label={label}
      value={curExercise.apparatus}
      options={availableApparatusOptions}
      unavailableOptions={unavailableApparatusOptions}
      onSelect={onSelect}
      onAddCustom={addCustomExerciseApparatus}
      className={className}
    />
  );
};
