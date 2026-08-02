import { mutate } from "swr";
import type { Program, ProgramSummary, User } from "@liftledger/shared";
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

export const useProgramSummaries = () => {
  const basePath = useProgramBasePath();
  const userId = useCurrentUserId();
  return useGet<ProgramSummary[]>(userId ? basePath : null);
};

export const useHistoricalProgram = (programId: string | undefined) => {
  const basePath = useProgramBasePath();
  const userId = useCurrentUserId();
  return useGet<Program>(
    userId && programId ? `${basePath}/${programId}` : null,
  );
};

export const useStartProgram = () => {
  const basePath = useProgramBasePath();
  const refreshCompletedExercises = useRefreshCompletedExercises();
  return usePost<{ program: Program }, User>(basePath, {
    onSuccess: async (user) => {
      await propagateUserToCaches(user);
      await mutate(basePath);
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
      await mutate(basePath);
      await refreshCompletedExercises();
    },
  });
};

export const useUpdateHistoricalProgram = (programId: string) => {
  const basePath = useProgramBasePath();
  const refreshCompletedExercises = useRefreshCompletedExercises();
  const put = usePut<
    { program: Program; historical: true },
    { program: Program }
  >(`${basePath}/${programId}`, {
    onSuccess: async (res) => {
      await mutate(`${basePath}/${programId}`, res.program, {
        revalidate: false,
      });
      await mutate(basePath);
      await refreshCompletedExercises();
    },
  });

  return {
    ...put,
    send: (arg: { program: Program }) => put.send({ ...arg, historical: true }),
  };
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
        await mutate(basePath);
      }
    },
  });
};
