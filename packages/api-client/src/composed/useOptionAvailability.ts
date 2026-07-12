import { Exercise } from "@liftledger/shared";
import { useCallback } from "react";
import { useExerciseNameOptions } from "../api/exerciseNameOptions";
import { useEquipmentOptions } from "../api/equipmentOptions";

export interface CurrentExercisesState {
  curExercise: Exercise;
  allReservedExercises: Exercise[];
}

export const useOptionAvailability = (
  exercisesState?: CurrentExercisesState,
) => {
  const { data: allExerciseNameOptions = [] } = useExerciseNameOptions();
  const { data: allEquipmentOptions = [] } = useEquipmentOptions();

  const potentialExerciseAvailable = useCallback(
    (potentialExercise: Exercise) => {
      const { curExercise, allReservedExercises } = exercisesState!;

      const unavailableExercises = allReservedExercises.filter(
        (e) =>
          e.name !== curExercise.name || e.equipment !== curExercise.equipment,
      );

      const potentialExerciseUnavailable = unavailableExercises.find(
        (e) =>
          e.name === potentialExercise.name &&
          e.equipment === potentialExercise.equipment,
      );

      return !potentialExerciseUnavailable;
    },
    [exercisesState],
  );

  const availableExerciseNameOptions = exercisesState
    ? allExerciseNameOptions.filter((name) =>
        potentialExerciseAvailable({ ...exercisesState.curExercise, name }),
      )
    : allExerciseNameOptions;

  const availableEquipmentOptions = exercisesState
    ? allEquipmentOptions.filter((equipment) =>
        potentialExerciseAvailable({
          ...exercisesState.curExercise,
          equipment,
        }),
      )
    : allEquipmentOptions;

  return {
    availableExerciseNameOptions,
    availableEquipmentOptions,
  };
};
