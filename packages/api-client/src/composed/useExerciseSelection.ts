import { useCallback, useEffect } from "react";
import { useCompletedExercises } from "../api/useCompletedExercises";
import { useMe } from "../api/useMe";
import { useExerciseOptions } from "./useExerciseOptions";

export interface ExerciseSelectionStorage {
  selectedName: string;
  selectedEquipment: string;
  setSelectedName: (name: string) => void;
  setSelectedEquipment: (equipment: string) => void;
}

export const useExerciseSelection = ({
  selectedName,
  selectedEquipment,
  setSelectedName,
  setSelectedEquipment,
}: ExerciseSelectionStorage) => {
  const { data: curUser, isLoading: isUserLoading } = useMe();
  const { data: completedExercises, isLoading: completedExercisesLoading } =
    useCompletedExercises(curUser?._id);
  const {
    allExerciseNameOptions,
    allEquipmentOptions: allExerciseEquipmentOptions,
  } = useExerciseOptions();

  const firstEquipmentFor = useCallback(
    (name: string) =>
      completedExercises?.previous.find((ex) => ex.name === name)?.equipment,
    [completedExercises],
  );

  const selectName = useCallback(
    (name: string) => {
      setSelectedName(name);
      const equipment = firstEquipmentFor(name);
      if (equipment) setSelectedEquipment(equipment);
    },
    [firstEquipmentFor, setSelectedName, setSelectedEquipment],
  );

  useEffect(() => {
    if (!completedExercises || allExerciseNameOptions.length === 0) return;
    if (selectedName && selectedEquipment) return;

    if (!selectedName) {
      const seedName =
        allExerciseNameOptions.find((name) =>
          completedExercises?.previous.some((ex) => ex.name === name),
        ) ?? allExerciseNameOptions[0];
      setSelectedName(seedName);
      setSelectedEquipment(
        firstEquipmentFor(seedName) ?? allExerciseEquipmentOptions[0] ?? "",
      );
      return;
    }

    setSelectedEquipment(
      firstEquipmentFor(selectedName) ?? allExerciseEquipmentOptions[0] ?? "",
    );
  }, [
    selectedName,
    selectedEquipment,
    completedExercisesLoading,
    completedExercises,
    allExerciseNameOptions,
    allExerciseEquipmentOptions,
    firstEquipmentFor,
    setSelectedName,
    setSelectedEquipment,
  ]);

  const isLoading =
    isUserLoading ||
    completedExercisesLoading ||
    !selectedName ||
    !selectedEquipment;

  return {
    selectedName,
    selectedEquipment,
    selectName,
    setSelectedEquipment,
    isLoading,
  };
};
