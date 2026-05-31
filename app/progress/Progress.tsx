"use client";

import { useCompletedExercises, useMe } from "@liftledger/api-client";
import { LogoSpinner } from "@/app/components/LogoSpinner";
import { ExerciseSelector } from "./ExerciseSelector";
import { ProgressChart } from "./ProgressChart";

export const Progress = () => {
  const { data: curUser } = useMe();
  const { isLoading: completedExercisesLoading } = useCompletedExercises(
    curUser?._id,
  );

  if (completedExercisesLoading) return <LogoSpinner />;

  return (
    <div
      className="d-flex flex-column h-100 w-100"
      style={{ padding: "15px 0px" }}
    >
      <ExerciseSelector />
      <ProgressChart />
    </div>
  );
};
