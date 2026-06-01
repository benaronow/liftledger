import useSWR, { SWRConfiguration, mutate } from "swr";
import useSWRMutation from "swr/mutation";
import type { TimerPresets } from "@liftledger/shared";
import { getApiClient } from "../client";
import { fetcher } from "../fetcher";

export const timerEndKey = (userId: string | undefined | null) =>
  userId ? `/users/${userId}/timerEnd` : null;

export const timerPresetsKey = (userId: string | undefined | null) =>
  userId ? `/users/${userId}/timerPresets` : null;

export interface TimerEndResponse {
  timerEnd?: Date | string;
}

export interface TimerPresetsResponse {
  timerPresets: TimerPresets;
}

export const useTimerEnd = (
  userId: string | undefined | null,
  config?: SWRConfiguration<TimerEndResponse>,
) => useSWR<TimerEndResponse>(timerEndKey(userId), fetcher, config);

export const useTimerPresets = (
  userId: string | undefined | null,
  config?: SWRConfiguration<TimerPresetsResponse>,
) => useSWR<TimerPresetsResponse>(timerPresetsKey(userId), fetcher, config);

// Same explicit-userId pattern as block.ts — no implicit useMe() subscription.

export const useSetTimerEnd = () =>
  useSWRMutation(
    "mutation:setTimerEnd",
    async (
      _key: string,
      { arg }: { arg: { userId: string; timerEnd: Date | string } },
    ): Promise<void> => {
      await getApiClient().put(`/users/${arg.userId}/timerEnd`, arg.timerEnd);
      await mutate(
        timerEndKey(arg.userId),
        { timerEnd: arg.timerEnd },
        { revalidate: false },
      );
    },
  );

export const useClearTimerEnd = () =>
  useSWRMutation(
    "mutation:clearTimerEnd",
    async (
      _key: string,
      { arg: userId }: { arg: string },
    ): Promise<void> => {
      await getApiClient().delete(`/users/${userId}/timerEnd`);
      await mutate(
        timerEndKey(userId),
        { timerEnd: undefined },
        { revalidate: false },
      );
    },
  );

export const useUpdateTimerPresets = () =>
  useSWRMutation(
    "mutation:updateTimerPresets",
    async (
      _key: string,
      { arg }: { arg: { userId: string; timerPresets: TimerPresets } },
    ): Promise<TimerPresets> => {
      const res = await getApiClient().put<TimerPresetsResponse>(
        `/users/${arg.userId}/timerPresets`,
        arg.timerPresets,
      );
      await mutate(timerPresetsKey(arg.userId), res.data, {
        revalidate: false,
      });
      return res.data.timerPresets;
    },
  );
