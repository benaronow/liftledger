import {
  CurrentExercisesState,
  useAddEquipment,
  useEquipmentOptions,
  useOptionAvailability,
} from "@liftledger/api-client";
import { ReactNode, useMemo } from "react";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
  currentExercisesState?: CurrentExercisesState;
  value: string;
  onSelect: (value: string) => void;
  label?: string;
  error?: string;
  canAddCustom?: boolean;
  prefix?: (item: string) => ReactNode;
  trailing?: (item: string) => ReactNode;
  renderTrigger?: (open: () => void) => ReactNode;
  dismissOnSelect?: boolean;
}

export const EquipmentSelect = ({
  currentExercisesState,
  value,
  onSelect,
  label,
  error,
  canAddCustom,
  prefix,
  trailing,
  renderTrigger,
  dismissOnSelect,
}: Props) => {
  const { data: allExerciseEquipmentOptions = [] } = useEquipmentOptions();
  const { send: addExerciseEquipment } = useAddEquipment();
  const { availableEquipmentOptions: availableExerciseEquipmentOptions } =
    useOptionAvailability(currentExercisesState);

  const handleAddEquipment = async (equipment: string) => {
    await addExerciseEquipment({ value: equipment });
  };

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
      onAddCustom={handleAddEquipment}
      canAddCustom={canAddCustom}
      prefix={prefix}
      trailing={trailing}
      renderTrigger={renderTrigger}
      dismissOnSelect={dismissOnSelect}
      placeholder={
        canAddCustom ? "Search or add equipment..." : "Search equipment..."
      }
    />
  );
};
