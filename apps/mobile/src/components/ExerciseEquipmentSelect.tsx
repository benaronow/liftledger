import {
  CurrentExercisesState,
  useExerciseOptions,
} from "@liftledger/api-client";
import { useMemo } from "react";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
  currentExercisesState?: CurrentExercisesState;
  value: string;
  onSelect: (value: string) => void;
  label?: string;
  error?: string;
  canAddCustom?: boolean;
}

export const ExerciseEquipmentSelect = ({
  currentExercisesState,
  value,
  onSelect,
  label,
  error,
  canAddCustom,
}: Props) => {
  const {
    addExerciseEquipment,
    allExerciseEquipmentOptions,
    availableExerciseEquipmentOptions,
  } = useExerciseOptions(currentExercisesState);

  const unavailableEquipmentOptions = useMemo(
    () =>
      allExerciseEquipmentOptions.filter(
        (o) => !availableExerciseEquipmentOptions.includes(o),
      ),
    [availableExerciseEquipmentOptions, allExerciseEquipmentOptions],
  );

  return (
    <SearchableSelect
      label={label}
      error={error}
      value={value}
      options={availableExerciseEquipmentOptions}
      unavailableOptions={unavailableEquipmentOptions}
      onSelect={onSelect}
      onAddCustom={addExerciseEquipment}
      canAddCustom={canAddCustom}
      placeholder={
        canAddCustom ? "Search or add equipment..." : "Search equipment..."
      }
    />
  );
};
