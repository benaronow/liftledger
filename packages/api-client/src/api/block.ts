import useSWR, { SWRConfiguration, mutate } from "swr";
import useSWRMutation from "swr/mutation";
import type { Block, User } from "@liftledger/shared";
import { getApiClient } from "../client";
import { fetcher } from "../fetcher";
import { meKey } from "./me";
import { propagateUserToCaches, userKey } from "./user";
import { completedExercisesKey } from "./completed-exercises";

export const userBlockKey = (
  userId: string | undefined | null,
  blockId: string | undefined | null,
) => (userId && blockId ? `/users/${userId}/blocks/${blockId}` : null);

export const useUserBlock = (
  userId: string | undefined | null,
  blockId: string | undefined | null,
  config?: SWRConfiguration<Block>,
) => useSWR<Block>(userBlockKey(userId, blockId), fetcher, config);

export interface UpdateBlockResponse {
  block: Block;
  done: boolean;
}

// Mutation triggers take an explicit `userId` rather than reading it from
// useMe() internally. The implicit-useMe pattern subscribed to /users/me at
// hook setup time and fired fetches before Auth0 had wired the token-getter,
// causing a 401-then-200 race on first load.

export const useStartBlock = () =>
  useSWRMutation(
    "mutation:startBlock",
    async (
      _key: string,
      { arg }: { arg: { userId: string; block: Block } },
    ): Promise<User> => {
      const res = await getApiClient().post<User>(
        `/users/${arg.userId}/startBlock`,
        { block: arg.block },
      );
      await propagateUserToCaches(res.data);
      await mutate(completedExercisesKey(arg.userId));
      return res.data;
    },
  );

export const useQuitBlock = () =>
  useSWRMutation(
    "mutation:quitBlock",
    async (
      _key: string,
      { arg: userId }: { arg: string },
    ): Promise<User> => {
      const res = await getApiClient().post<User>(`/users/${userId}/quitBlock`);
      await propagateUserToCaches(res.data);
      await mutate(completedExercisesKey(userId));
      return res.data;
    },
  );

export const useUpdateUserBlock = () =>
  useSWRMutation(
    "mutation:updateUserBlock",
    async (
      _key: string,
      {
        arg,
      }: {
        arg: {
          userId: string;
          block: Block;
          completedExercises?: unknown[];
        };
      },
    ): Promise<UpdateBlockResponse> => {
      if (!arg.block._id)
        throw new Error("useUpdateUserBlock: block has no _id");

      const res = await getApiClient().put<UpdateBlockResponse>(
        `/users/${arg.userId}/blocks/${arg.block._id}`,
        { block: arg.block, completedExercises: arg.completedExercises },
      );
      await mutate(userBlockKey(arg.userId, arg.block._id), res.data.block, {
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
