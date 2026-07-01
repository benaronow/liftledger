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

export const ExerciseEquipmentSelect = ({
  curExercise,
  reservedExercises,
  onSelect,
  label,
  error,
}: Props) => {
  const {
    addCustomExerciseEquipment,
    allExerciseEquipmentOptions,
    getAvailableExerciseEquipmentOptions,
  } = useExerciseOptions();

  const availableEquipmentOptions = useMemo(
    () => getAvailableExerciseEquipmentOptions(curExercise, reservedExercises),
    [getAvailableExerciseEquipmentOptions, curExercise, reservedExercises],
  );

  const unavailableEquipmentOptions = useMemo(
    () =>
      allExerciseEquipmentOptions.filter(
        (o) => !availableEquipmentOptions.includes(o),
      ),
    [availableEquipmentOptions, allExerciseEquipmentOptions],
  );

  return (
    <SearchableSelect
      label={label}
      error={error}
      value={curExercise.equipment}
      options={availableEquipmentOptions}
      unavailableOptions={unavailableEquipmentOptions}
      onSelect={onSelect}
      onAddCustom={addCustomExerciseEquipment}
      canAddCustom
      placeholder="Enter or add an equipment..."
    />
  );
};
