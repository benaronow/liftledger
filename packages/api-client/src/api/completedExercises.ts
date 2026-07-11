import { mutate } from "swr";
import type { CompletedExercisesResponse } from "@liftledger/shared";
import { useGet } from "../fetcher";
import { useCurrentUserId } from "./me";
import { useCallback } from "react";

const useCompletedExercisesBasePath = () => {
  const userId = useCurrentUserId();
  return `/users/${userId}/completedExercises`;
};

export const useCompletedExercises = () => {
  const userId = useCurrentUserId();
  const basePath = useCompletedExercisesBasePath();
  return useGet<CompletedExercisesResponse>(userId ? basePath : null);
};

export const useRefreshCompletedExercises = () => {
  const basePath = useCompletedExercisesBasePath();
  return useCallback(() => mutate(basePath), [basePath]);
};
