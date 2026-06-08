import useSWR, { SWRConfiguration, mutate } from "swr";
import useSWRMutation from "swr/mutation";
import type { Program, User } from "@liftledger/shared";
import { getApiClient } from "../client";
import { fetcher } from "../fetcher";
import { meKey } from "./useMe";
import { propagateUserToCaches, userKey } from "./useUser";
import { completedExercisesKey } from "./useCompletedExercises";

export const programKey = (
  userId: string | undefined | null,
  programId: string | undefined | null,
) => (userId && programId ? `/users/${userId}/programs/${programId}` : null);

export const useProgram = (
  userId: string | undefined | null,
  programId: string | undefined | null,
  config?: SWRConfiguration<Program>,
) => useSWR<Program>(programKey(userId, programId), fetcher, config);

export interface UpdateProgramResponse {
  program: Program;
  done: boolean;
}

export const useStartProgram = () =>
  useSWRMutation(
    "mutation:startProgram",
    async (
      _key: string,
      { arg }: { arg: { userId: string; program: Program } },
    ): Promise<User> => {
      const res = await getApiClient().post<User>(
        `/users/${arg.userId}/startProgram`,
        { program: arg.program },
      );
      await propagateUserToCaches(res.data);
      await mutate(completedExercisesKey(arg.userId));
      return res.data;
    },
  );

export const useQuitProgram = () =>
  useSWRMutation(
    "mutation:quitProgram",
    async (_key: string, { arg: userId }: { arg: string }): Promise<User> => {
      const res = await getApiClient().post<User>(`/users/${userId}/quitProgram`);
      await propagateUserToCaches(res.data);
      await mutate(completedExercisesKey(userId));
      return res.data;
    },
  );

export const useUpdateUserProgram = () =>
  useSWRMutation(
    "mutation:updateUserProgram",
    async (
      _key: string,
      {
        arg,
      }: {
        arg: {
          userId: string;
          program: Program;
          completedExercises?: unknown[];
        };
      },
    ): Promise<UpdateProgramResponse> => {
      if (!arg.program._id)
        throw new Error("useUpdateUserProgram: program has no _id");

      const res = await getApiClient().put<UpdateProgramResponse>(
        `/users/${arg.userId}/programs/${arg.program._id}`,
        { program: arg.program, completedExercises: arg.completedExercises },
      );
      await mutate(programKey(arg.userId, arg.program._id), res.data.program, {
        revalidate: false,
      });
      await mutate(completedExercisesKey(arg.userId));
      if (res.data.done) {
        await mutate(meKey());
        await mutate(userKey(arg.userId));
      }
      return res.data;
    },
  );
