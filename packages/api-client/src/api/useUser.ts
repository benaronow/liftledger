import useSWR, { SWRConfiguration, mutate } from "swr";
import useSWRMutation from "swr/mutation";
import type { User } from "@liftledger/shared";
import { getApiClient } from "../client";
import { fetcher } from "../fetcher";
import { completedExercisesKey } from "./useCompletedExercises";
import { meKey } from "./useMe";

export const userKey = (id: string | undefined | null) =>
  id ? `/users/${id}` : null;

export const useUser = (
  id: string | undefined | null,
  config?: SWRConfiguration<User>,
) => useSWR<User>(userKey(id), fetcher, config);

export const propagateUserToCaches = async (user: User) => {
  await mutate(meKey(), user, { revalidate: false });
  if (user._id) await mutate(userKey(user._id), user, { revalidate: false });
};

export const useCreateUser = () =>
  useSWRMutation(
    "mutation:createUser",
    async (
      _key: string,
      { arg: user }: { arg: Partial<User> },
    ): Promise<User> => {
      const res = await getApiClient().post<User>("/users", user);
      await propagateUserToCaches(res.data);
      return res.data;
    },
  );

export const useUpdateUser = () =>
  useSWRMutation(
    "mutation:updateUser",
    async (_key: string, { arg: user }: { arg: User }): Promise<User> => {
      const res = await getApiClient().put<User>(`/users/${user._id}`, user);
      await propagateUserToCaches(res.data);
      return res.data;
    },
  );

export interface RenameExerciseArg {
  userId: string;
  field: "name" | "equipment" | "unit" | "gym";
  from: string;
  to: string;
  scope: "list" | "current" | "all";
}

export const useRenameExercise = () =>
  useSWRMutation(
    "mutation:renameExercise",
    async (
      _key: string,
      { arg: { userId, ...body } }: { arg: RenameExerciseArg },
    ): Promise<User> => {
      const res = await getApiClient().put<User>(
        `/users/${userId}/renameExercise`,
        body,
      );
      await propagateUserToCaches(res.data);
      await mutate(completedExercisesKey(userId));
      return res.data;
    },
  );
