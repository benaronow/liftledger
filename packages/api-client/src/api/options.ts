import { mutate } from "swr";
import type { RenameScope, User } from "@liftledger/shared";
import { useGet, usePut, usePatch, useDelete } from "../fetcher";
import { useCurrentUserId } from "./me";
import { propagateUserToCaches } from "./users";
import { useRefreshCompletedExercises } from "./completedExercises";

export type OptionSegment = "equipment" | "gyms" | "units" | "exerciseNames";

export const useOptionsBasePath = (segment: OptionSegment) => {
  const userId = useCurrentUserId();
  return `/users/${userId}/options/${segment}`;
};

export const syncCaches = async (basePath: string, user: User) => {
  await propagateUserToCaches(user);
  await mutate(basePath);
};

export const useOptions = (segment: OptionSegment) => {
  const userId = useCurrentUserId();
  const basePath = useOptionsBasePath(segment);
  return useGet<string[]>(userId ? basePath : null);
};

export const useAddOption = (segment: OptionSegment) => {
  const basePath = useOptionsBasePath(segment);
  return usePut<{ value: string }, User>(basePath, {
    onSuccess: (user) => syncCaches(basePath, user),
  });
};

export const useRenameOption = (segment: OptionSegment) => {
  const userId = useCurrentUserId();
  const basePath = useOptionsBasePath(segment);
  const refreshCompletedExercises = useRefreshCompletedExercises();
  return usePatch<{ from: string; to: string; scope: RenameScope }, User>(
    basePath,
    {
      onSuccess: async (user) => {
        await syncCaches(basePath, user);
        await refreshCompletedExercises();
        await mutate(
          (key) =>
            typeof key === "string" &&
            key.startsWith(`/users/${userId}/programs`),
        );
      },
    },
  );
};

export const useRemoveOption = (segment: OptionSegment) => {
  const basePath = useOptionsBasePath(segment);
  return useDelete<string, User>(basePath, {
    params: (value) => ({ value }),
    onSuccess: (user) => syncCaches(basePath, user),
  });
};
