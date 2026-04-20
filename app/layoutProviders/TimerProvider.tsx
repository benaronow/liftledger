"use client";

import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "@/lib/config";
import { USER_API_URL, useUser } from "./UserProvider";
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

export const TimerProvider = ({ children }: PropsWithChildren<object>) => {
  const { curUser } = useUser();
  const [timerEnd, setTimerEnd] = useState<Date>();
  const [timerPresets, setTimerPresets] = useState<{ [key: number]: number }>(
    {},
  );
  const [timerOpen, setTimerOpen] = useState(true);
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);

  useEffect(() => {
    if (curUser?._id) {
      getTimerEnd();
      getTimerPresets();
    }
  }, [curUser]);

  const getTimerEnd = async () => {
    const res = await api.get(`${USER_API_URL}/${curUser?._id}/timerEnd`);
    const result: { timerEnd: Date } = res.data;
    if (result) setTimerEnd(result.timerEnd);
  };

  const setTimer = async (timerEnd: Date | undefined) => {
    await api.put(`${USER_API_URL}/${curUser?._id}/timerEnd`, timerEnd);
    setTimerEnd(timerEnd);
  };

  const unsetTimer = async () => {
    await api.delete(`${USER_API_URL}/${curUser?._id}/timerEnd`);
    setTimerEnd(undefined);
  };

  const getTimerPresets = async () => {
    const res = await api.get(`${USER_API_URL}/${curUser?._id}/timerPresets`);
    const result: { timerPresets: { [key: number]: number } } = res.data;
    if (result) setTimerPresets(result.timerPresets);
  };

  const updateTimerPresets = async (timerPresets: {
    [key: number]: number;
  }) => {
    await api.put(`${USER_API_URL}/${curUser?._id}/timerPresets`, timerPresets);
    setTimerPresets(timerPresets);
  };

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
