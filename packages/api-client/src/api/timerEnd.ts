import { useGet, usePut, useDelete } from "../fetcher";
import { useCurrentUserId } from "./me";

export interface TimerEndResponse {
  timerEnd?: Date | string;
}

const useTimerEndBasePath = () => {
  const userId = useCurrentUserId();
  return `/users/${userId}/timer/end`;
};

export const useTimerEnd = () => {
  const userId = useCurrentUserId();
  const basePath = useTimerEndBasePath();
  return useGet<TimerEndResponse>(userId ? basePath : null);
};

export const useSetTimerEnd = () => {
  const basePath = useTimerEndBasePath();
  return usePut<Date | string, TimerEndResponse>(basePath, {
    optimistic: (timerEnd) => ({
      key: basePath,
      data: { timerEnd },
    }),
  });
};

export const useClearTimerEnd = () => {
  const basePath = useTimerEndBasePath();
  return useDelete<void, TimerEndResponse>(basePath, {
    optimistic: () => ({
      key: basePath,
      data: { timerEnd: undefined },
    }),
  });
};
