"use client";

import { useCompletedExercises } from "@/app/layoutContainer/CompletedExercisesProvider";
import { LogoSpinner } from "@/app/components/LogoSpinner";
import { ExerciseSelector } from "./ExerciseSelector";
import { ProgressChart } from "./ProgressChart";

export const Progress = () => {
  const { completedExercisesLoading } = useCompletedExercises();

  if (completedExercisesLoading) return <LogoSpinner />;

  return (
    <div className="d-flex flex-column h-100 w-100">
      <ExerciseSelector />
      <ProgressChart />
    </div>
  );
};
