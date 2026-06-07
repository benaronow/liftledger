import { useCallback, useEffect } from "react";
import { useCompletedExercises } from "../api/useCompletedExercises";
import { useMe } from "../api/useMe";
import { useExerciseOptions } from "./useExerciseOptions";

/**
 * Where the (name, apparatus) selection is stored. Web backs this with the URL
 * (`useSearchParams`) so progress views are shareable; mobile backs it with
 * `useState`. The hook owns the seeding/derivation logic and stays agnostic to
 * the storage.
 */
export interface ExerciseSelectionStorage {
  selectedName: string;
  selectedApparatus: string;
  setSelectedName: (name: string) => void;
  setSelectedApparatus: (apparatus: string) => void;
}

/**
 * Drives the Progress page's exercise/apparatus selection, shared between web
 * and mobile:
 *  - On first load (once data is in) seeds to the first exercise in the list
 *    that has entries — falling back to the first option — and that exercise's
 *    first entry's apparatus, so the initial view lands on real data.
 *  - Selecting an exercise (via the returned `selectName`) moves the apparatus
 *    to that exercise's first entry's apparatus. An exercise with no history
 *    leaves the apparatus untouched.
 */
export const useExerciseSelection = ({
  selectedName,
  selectedApparatus,
  setSelectedName,
  setSelectedApparatus,
}: ExerciseSelectionStorage) => {
  const { data: curUser, isLoading: isUserLoading } = useMe();
  const { data: completedExercises, isLoading: completedExercisesLoading } =
    useCompletedExercises(curUser?._id);
  const { allExerciseNameOptions, allExerciseApparatusOptions } =
    useExerciseOptions();

  // The apparatus of an exercise's first recorded entry, if any. `previous` is
  // newest-first, so this is the apparatus last used for that exercise.
  const firstApparatusFor = useCallback(
    (name: string) =>
      completedExercises?.previous.find((ex) => ex.name === name)?.apparatus,
    [completedExercises],
  );

  // Selecting an exercise also moves the apparatus to that of its first entry,
  // so the view shows data instead of an empty combo. An exercise with no
  // history leaves the apparatus untouched.
  const selectName = useCallback(
    (name: string) => {
      setSelectedName(name);
      const apparatus = firstApparatusFor(name);
      if (apparatus) setSelectedApparatus(apparatus);
    },
    [firstApparatusFor, setSelectedName, setSelectedApparatus],
  );

  // Seed once the data has loaded. Handles both a clean start (no name yet) and
  // a pre-set name with no apparatus (e.g. a shared/bookmarked web URL).
  useEffect(() => {
    if (completedExercisesLoading || allExerciseNameOptions.length === 0) return;
    if (selectedName && selectedApparatus) return;

    if (!selectedName) {
      const seedName =
        allExerciseNameOptions.find((name) =>
          completedExercises?.previous.some((ex) => ex.name === name),
        ) ?? allExerciseNameOptions[0];
      setSelectedName(seedName);
      setSelectedApparatus(
        firstApparatusFor(seedName) ?? allExerciseApparatusOptions[0] ?? "",
      );
      return;
    }

    setSelectedApparatus(
      firstApparatusFor(selectedName) ?? allExerciseApparatusOptions[0] ?? "",
    );
  }, [
    selectedName,
    selectedApparatus,
    completedExercisesLoading,
    completedExercises,
    allExerciseNameOptions,
    allExerciseApparatusOptions,
    firstApparatusFor,
    setSelectedName,
    setSelectedApparatus,
  ]);

  // True until the user is loaded, the completed-exercise data is in, and the
  // selection has been seeded — i.e. the view can render a stable selection.
  const isLoading =
    isUserLoading ||
    completedExercisesLoading ||
    !selectedName ||
    !selectedApparatus;

  return {
    selectedName,
    selectedApparatus,
    selectName,
    setSelectedApparatus,
    isLoading,
  };
};
