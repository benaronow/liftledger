import {
  CurrentExercisesState,
  useExerciseOptions,
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

export const ExerciseNameSelect = ({
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
  const {
    addExerciseName,
    allExerciseNameOptions,
    availableExerciseNameOptions,
  } = useExerciseOptions(currentExercisesState);

  const unavailableNameOptions = useMemo(
    () =>
      allExerciseNameOptions.filter(
        (o) => !availableExerciseNameOptions.includes(o),
      ),
    [availableExerciseNameOptions, allExerciseNameOptions],
  );

  return (
    <SearchableSelect
      label={label}
      error={error}
      value={value}
      options={availableExerciseNameOptions}
      unavailableOptions={unavailableNameOptions}
      onSelect={onSelect}
      onAddCustom={addExerciseName}
      canAddCustom={canAddCustom}
      prefix={prefix}
      trailing={trailing}
      renderTrigger={renderTrigger}
      dismissOnSelect={dismissOnSelect}
      placeholder={
        canAddCustom ? "Search or add exercise..." : "Search exercise..."
      }
    />
  );
};
