import { useEffect, useMemo } from "react";
import {
  findLatestOccurrence,
  useCompletedExercises,
  useMe,
} from "@liftledger/api-client";
import { LogoSpinner } from "@/components/LogoSpinner";
import { useExerciseOptions } from "@liftledger/api-client";
import { ExerciseSelector } from "./ExerciseSelector";
import { ProgressChart } from "./ProgressChart";
import { useProgressSelection } from "./useProgressSelection";

export const Progress = () => {
  const { data: curUser, isLoading: isUserLoading } = useMe();
  const { data: completedExercises, isLoading: completedExercisesLoading } =
    useCompletedExercises(curUser?._id);
  const { allExerciseNameOptions, allExerciseApparatusOptions } =
    useExerciseOptions();
  const {
    selectedName,
    selectedApparatus,
    setSelectedName,
    setSelectedApparatus,
  } = useProgressSelection();

  useEffect(() => {
    if (selectedName) return;

    const firstCompleted = completedExercises?.previous[0]?.name;
    if (firstCompleted) {
      setSelectedName(firstCompleted);
      return;
    }

    const fallback = allExerciseNameOptions[0];
    if (fallback) setSelectedName(fallback);
  }, [
    selectedName,
    completedExercises,
    allExerciseNameOptions,
    setSelectedName,
  ]);

  useEffect(() => {
    if (!selectedName) return;

    const matchingOccurrence = findLatestOccurrence(
      completedExercises,
      (e) => e.name === selectedName && e.apparatus === selectedApparatus,
    );
    if (matchingOccurrence) return;

    const firstMatch = completedExercises?.previous.find(
      (ex) => ex.name === selectedName,
    );
    if (firstMatch) {
      setSelectedApparatus(firstMatch.apparatus);
      return;
    }

    const fallback = allExerciseApparatusOptions[0];
    if (fallback) setSelectedApparatus(fallback);
  }, [
    selectedName,
    selectedApparatus,
    completedExercises,
    allExerciseApparatusOptions,
    setSelectedApparatus,
  ]);

  // True once the (name, apparatus) pair is stable: either it matches real data,
  // or there is genuinely no history for this name at all (NoDataPlaceholder is correct).
  // Stays false while the apparatus-seeding effect hasn't fired yet.
  const isSelectionSettled = useMemo(() => {
    if (!completedExercises || !selectedName) return false;

    const hasAnyForName = completedExercises.previous.some(
      (e) => e.name === selectedName,
    );
    if (!hasAnyForName) return true;

    return completedExercises.previous.some(
      (e) =>
        e.name === selectedName &&
        e.apparatus === selectedApparatus &&
        e.completedDate != null &&
        e.sets.some((s) => s.completed),
    );
  }, [completedExercises, selectedName, selectedApparatus]);

  if (
    isUserLoading ||
    completedExercisesLoading ||
    !selectedName ||
    !selectedApparatus ||
    !isSelectionSettled
  )
    return <LogoSpinner />;

  return (
    <div
      className="d-flex flex-column h-100 w-100"
      style={{ padding: "15px 0px" }}
    >
      <ExerciseSelector />
      <ProgressChart
        selectedName={selectedName}
        selectedApparatus={selectedApparatus}
      />
    </div>
  );
};
