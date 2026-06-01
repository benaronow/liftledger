import { useEffect } from "react";
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

  // Seed `name` if the URL doesn't carry one yet — prefer the user's most
  // recently completed exercise, fall back to first available option.
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

  // Seed `apparatus` when the current name has no matching occurrence for the
  // currently-selected apparatus.
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

  if (
    isUserLoading ||
    completedExercisesLoading ||
    !selectedName ||
    !selectedApparatus
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
