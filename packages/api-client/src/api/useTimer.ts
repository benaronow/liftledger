import useSWR, { SWRConfiguration, mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { getApiClient } from "../client";
import { fetcher } from "../fetcher";

export const timerEndKey = (userId: string | undefined | null) =>
  userId ? `/users/${userId}/timerEnd` : null;

export interface TimerEndResponse {
  timerEnd?: Date | string;
}

export const useTimerEnd = (
  userId: string | undefined | null,
  config?: SWRConfiguration<TimerEndResponse>,
) => useSWR<TimerEndResponse>(timerEndKey(userId), fetcher, config);

// Same explicit-userId pattern as program.ts — no implicit useMe() subscription.
//
// Both mutations are optimistic: the timerEnd cache updates immediately (so the
// timer shows/hides without waiting on the round-trip) and rolls back if the
// request fails. `mutate` rejects on failure, so the trigger rejects too and
// callers can surface a toast.

export const useSetTimerEnd = () =>
  useSWRMutation(
    "mutation:setTimerEnd",
    async (
      _key: string,
      { arg }: { arg: { userId: string; timerEnd: Date | string } },
    ): Promise<void> => {
      await mutate(
        timerEndKey(arg.userId),
        getApiClient()
          .put(`/users/${arg.userId}/timerEnd`, arg.timerEnd)
          .then(() => ({ timerEnd: arg.timerEnd })),
        {
          optimisticData: { timerEnd: arg.timerEnd },
          rollbackOnError: true,
          revalidate: false,
        },
      );
    },
  );

export const useClearTimerEnd = () =>
  useSWRMutation(
    "mutation:clearTimerEnd",
    async (_key: string, { arg: userId }: { arg: string }): Promise<void> => {
      await mutate(
        timerEndKey(userId),
        getApiClient()
          .delete(`/users/${userId}/timerEnd`)
          .then(() => ({ timerEnd: undefined })),
        {
          optimisticData: { timerEnd: undefined },
          rollbackOnError: true,
          revalidate: false,
        },
      );
    },
  );
