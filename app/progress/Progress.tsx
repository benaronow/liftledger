"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/layoutProviders/UserProvider";
import { useCompletedExercises } from "@/app/layoutProviders/CompletedExercisesProvider";
import { useScreenState } from "@/app/layoutProviders/ScreenStateProvider";
import { LogoSpinner } from "@/app/components/LogoSpinner";
import { ExerciseSelector } from "./ExerciseSelector";
import { ProgressChart } from "./ProgressChart";

export const Progress = () => {
  const router = useRouter();
  const { session } = useUser();
  const { completedExercisesLoading } = useCompletedExercises();

  const { isFetching, toggleScreenState } = useScreenState();
  useEffect(() => {
    if (!session) {
      router.push("/dashboard");
    } else {
      toggleScreenState("fetching", false);
    }
  }, []);

  if (isFetching || completedExercisesLoading) return <LogoSpinner />;

  return (
    <div
      className="d-flex flex-column w-100"
      style={{
        height: "100dvh",
        padding: "65px 15px 85px",
        overflow: "hidden",
      }}
    >
      <ExerciseSelector />
      <ProgressChart />
    </div>
  );
};
