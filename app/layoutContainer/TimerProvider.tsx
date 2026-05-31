"use client";

import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  useClearTimerEnd,
  useSetTimerEnd,
  useTimerEnd,
  useTimerPresets,
  useUpdateTimerPresets,
} from "@liftledger/api-client";
import type { TimerPresets } from "@liftledger/shared";
import { useUser } from "./UserProvider";
import { Timer } from "@/app/components/Timer";

interface TimerContextType {
  timerEnd?: Date;
  setTimer: (timerEnd: Date | undefined) => Promise<void>;
  unsetTimer: () => Promise<void>;
  timerPresets: { [key: number]: number };
  updateTimerPresets: (timerPresets: {
    [key: number]: number;
  }) => Promise<void>;
  timerOpen: boolean;
  setTimerOpen: Dispatch<SetStateAction<boolean>>;
  timerDialogOpen: boolean;
  setTimerDialogOpen: Dispatch<SetStateAction<boolean>>;
}

const defaultTimerContext: TimerContextType = {
  setTimer: async () => {},
  unsetTimer: async () => {},
  timerPresets: {},
  updateTimerPresets: async () => {},
  timerOpen: true,
  setTimerOpen: () => {},
  timerDialogOpen: false,
  setTimerDialogOpen: () => {},
};

export const TimerContext = createContext(defaultTimerContext);

const toDate = (value: Date | string | undefined): Date | undefined => {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
};

export const TimerProvider = ({ children }: PropsWithChildren<object>) => {
  const { curUser } = useUser();
  const { data: timerEndData } = useTimerEnd(curUser?._id);
  const { data: timerPresetsData } = useTimerPresets(curUser?._id);
  const [timerOpen, setTimerOpen] = useState(true);
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);

  const timerEnd = useMemo(
    () => toDate(timerEndData?.timerEnd),
    [timerEndData?.timerEnd],
  );
  const timerPresets = useMemo<{ [key: number]: number }>(
    () => timerPresetsData?.timerPresets ?? {},
    [timerPresetsData?.timerPresets],
  );

  const { trigger: triggerSetTimerEnd } = useSetTimerEnd();
  const { trigger: triggerClearTimerEnd } = useClearTimerEnd();
  const { trigger: triggerUpdateTimerPresets } = useUpdateTimerPresets();

  const setTimer = useCallback(
    async (timerEnd: Date | undefined) => {
      if (!curUser?._id) return;
      if (timerEnd === undefined) {
        await triggerClearTimerEnd(curUser._id);
      } else {
        await triggerSetTimerEnd({ userId: curUser._id, timerEnd });
      }
    },
    [curUser?._id, triggerClearTimerEnd, triggerSetTimerEnd],
  );

  const unsetTimer = useCallback(async () => {
    if (!curUser?._id) return;
    await triggerClearTimerEnd(curUser._id);
  }, [curUser?._id, triggerClearTimerEnd]);

  const updateTimerPresets = useCallback(
    async (timerPresets: { [key: number]: number }) => {
      if (!curUser?._id) return;
      await triggerUpdateTimerPresets({
        userId: curUser._id,
        timerPresets: timerPresets as unknown as TimerPresets,
      });
    },
    [curUser?._id, triggerUpdateTimerPresets],
  );

  return (
    <TimerContext.Provider
      value={{
        timerEnd,
        setTimer,
        unsetTimer,
        timerPresets,
        updateTimerPresets,
        timerOpen,
        setTimerOpen,
        timerDialogOpen,
        setTimerDialogOpen,
      }}
    >
      <Timer />
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
