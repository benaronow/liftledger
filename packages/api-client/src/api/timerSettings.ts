import { mutate } from "swr";
import type { TimerSettings, User } from "@liftledger/shared";
import { useGet, usePatch } from "../fetcher";
import { useCurrentUserId } from "./me";
import { propagateUserToCaches } from "./users";

export interface TimerSettingsResponse {
  timerSettings?: TimerSettings;
}

const useTimerSettingsBasePath = () => {
  const userId = useCurrentUserId();
  return `/users/${userId}/timer/settings`;
};

export const useTimerSettings = () => {
  const userId = useCurrentUserId();
  const basePath = useTimerSettingsBasePath();
  return useGet<TimerSettingsResponse>(userId ? basePath : null);
};

export const useUpdateTimerSettings = () => {
  const basePath = useTimerSettingsBasePath();
  return usePatch<{ patch: Partial<TimerSettings> }, User>(basePath, {
    onSuccess: async (user) => {
      await propagateUserToCaches(user);
      await mutate(
        basePath,
        { timerSettings: user.timer.settings },
        { revalidate: false },
      );
    },
  });
};
