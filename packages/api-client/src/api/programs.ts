import { mutate } from "swr";
import type { Program, User } from "@liftledger/shared";
import { useGet, usePost, usePut, useDelete } from "../fetcher";
import { useMe, useCurrentUserId, refreshMe } from "./me";
import { propagateUserToCaches } from "./users";
import { useRefreshCompletedExercises } from "./completedExercises";

export interface UpdateProgramResponse {
  program: Program;
  done: boolean;
}

export const useProgramBasePath = () => {
  const userId = useCurrentUserId();
  return `/users/${userId}/programs`;
};

export const useProgram = () => {
  const basePath = useProgramBasePath();
  const { data: { curProgram } = {} } = useMe();
  return useGet<Program>(curProgram ? `${basePath}/${curProgram}` : null);
};

export const useStartProgram = () => {
  const basePath = useProgramBasePath();
  const refreshCompletedExercises = useRefreshCompletedExercises();
  return usePost<{ program: Program }, User>(basePath, {
    onSuccess: async (user) => {
      await propagateUserToCaches(user);
      await refreshCompletedExercises();
    },
  });
};

export const useQuitProgram = () => {
  const basePath = useProgramBasePath();
  const refreshCompletedExercises = useRefreshCompletedExercises();
  return useDelete<void, User>(basePath, {
    onSuccess: async (user) => {
      await propagateUserToCaches(user);
      await refreshCompletedExercises();
    },
  });
};

export const useUpdateUserProgram = () => {
  const basePath = useProgramBasePath();
  const { data: { curProgram } = {} } = useMe();
  const refreshCompletedExercises = useRefreshCompletedExercises();
  return usePut<
    { program: Program; completedExercises?: unknown[] },
    UpdateProgramResponse
  >(`${basePath}/${curProgram}`, {
    onSuccess: async (res) => {
      await mutate(`${basePath}/${curProgram}`, res.program, {
        revalidate: false,
      });
      await refreshCompletedExercises();
      if (res.done) {
        await refreshMe();
      }
    },
  });
};
