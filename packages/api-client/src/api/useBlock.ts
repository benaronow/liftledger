import useSWR, { SWRConfiguration, mutate } from "swr";
import useSWRMutation from "swr/mutation";
import type { Block, User } from "@liftledger/shared";
import { getApiClient } from "../client";
import { fetcher } from "../fetcher";
import { meKey } from "./useMe";
import { propagateUserToCaches, userKey } from "./useUser";
import { completedExercisesKey } from "./useCompletedExercises";

export const blockKey = (
  userId: string | undefined | null,
  blockId: string | undefined | null,
) => (userId && blockId ? `/users/${userId}/blocks/${blockId}` : null);

export const useBlock = (
  userId: string | undefined | null,
  blockId: string | undefined | null,
  config?: SWRConfiguration<Block>,
) => useSWR<Block>(blockKey(userId, blockId), fetcher, config);

export interface UpdateBlockResponse {
  block: Block;
  done: boolean;
}

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
    async (_key: string, { arg: userId }: { arg: string }): Promise<User> => {
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
      await mutate(blockKey(arg.userId, arg.block._id), res.data.block, {
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
