import useSWR, { SWRConfiguration } from "swr";
import type { CompletedExercise, Exercise } from "@liftledger/shared";
import { fetcher } from "../fetcher";

export const completedExercisesKey = (userId: string | undefined | null) =>
  userId ? `/users/${userId}/completedExercises` : null;

export interface CompletedExercisesResponse {
  current: Exercise[];
  previous: CompletedExercise[];
}

export const useCompletedExercises = (
  userId: string | undefined | null,
  config?: SWRConfiguration<CompletedExercisesResponse>,
) =>
  useSWR<CompletedExercisesResponse>(
    completedExercisesKey(userId),
    fetcher,
    config,
  );
