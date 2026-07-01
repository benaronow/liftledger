import { useCallback, useEffect } from "react";
import { useCompletedExercises } from "../api/useCompletedExercises";
import { useMe } from "../api/useMe";
import { useExerciseOptions } from "./useExerciseOptions";

/**
 * Where the (name, equipment) selection is stored. Web backs this with the URL
 * (`useSearchParams`) so progress views are shareable; mobile backs it with
 * `useState`. The hook owns the seeding/derivation logic and stays agnostic to
 * the storage.
 */
export interface ExerciseSelectionStorage {
  selectedName: string;
  selectedEquipment: string;
  setSelectedName: (name: string) => void;
  setSelectedEquipment: (equipment: string) => void;
}

/**
 * Drives the Progress page's exercise/equipment selection, shared between web
 * and mobile:
 *  - On first load (once data is in) seeds to the first exercise in the list
 *    that has entries — falling back to the first option — and that exercise's
 *    first entry's equipment, so the initial view lands on real data.
 *  - Selecting an exercise (via the returned `selectName`) moves the equipment
 *    to that exercise's first entry's equipment. An exercise with no history
 *    leaves the equipment untouched.
 */
export const useExerciseSelection = ({
  selectedName,
  selectedEquipment,
  setSelectedName,
  setSelectedEquipment,
}: ExerciseSelectionStorage) => {
  const { data: curUser, isLoading: isUserLoading } = useMe();
  const { data: completedExercises, isLoading: completedExercisesLoading } =
    useCompletedExercises(curUser?._id);
  const { allExerciseNameOptions, allExerciseEquipmentOptions } =
    useExerciseOptions();

  // The equipment of an exercise's first recorded entry, if any. `previous` is
  // newest-first, so this is the equipment last used for that exercise.
  const firstEquipmentFor = useCallback(
    (name: string) =>
      completedExercises?.previous.find((ex) => ex.name === name)?.equipment,
    [completedExercises],
  );

  // Selecting an exercise also moves the equipment to that of its first entry,
  // so the view shows data instead of an empty combo. An exercise with no
  // history leaves the equipment untouched.
  const selectName = useCallback(
    (name: string) => {
      setSelectedName(name);
      const equipment = firstEquipmentFor(name);
      if (equipment) setSelectedEquipment(equipment);
    },
    [firstEquipmentFor, setSelectedName, setSelectedEquipment],
  );

  // Seed once the data has loaded. Handles both a clean start (no name yet) and
  // a pre-set name with no equipment (e.g. a shared/bookmarked web URL).
  useEffect(() => {
    // Wait for the data itself, not just the loading flag: while the user is
    // still loading, `useCompletedExercises` runs with a null key (no user id),
    // which SWR reports as `isLoading: false`. Gating on `completedExercises`
    // being defined avoids seeding before the history has actually arrived. A
    // user with no history gets a defined `{ current: [], previous: [] }` and
    // still falls through to the alphabetical default below.
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

  // True until the user is loaded, the completed-exercise data is in, and the
  // selection has been seeded — i.e. the view can render a stable selection.
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
