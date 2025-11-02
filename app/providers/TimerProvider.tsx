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
import { useUser } from "./UserProvider";

const TIMER_API_URL = "/api/timerStart";

interface TimerContextType {
  timerEnd?: Date;
  setTimer: (timerEnd: Date | undefined) => Promise<void>;
  unsetTimer: () => Promise<void>;
  timerOpen: boolean;
  setTimerOpen: Dispatch<SetStateAction<boolean>>;
  timerDialogOpen: boolean;
  setTimerDialogOpen: Dispatch<SetStateAction<boolean>>;
}

const defaultTimerContext: TimerContextType = {
  setTimer: async () => {},
  unsetTimer: async () => {},
  timerOpen: true,
  setTimerOpen: () => {},
  timerDialogOpen: false,
  setTimerDialogOpen: () => {},
};

export const TimerContext = createContext(defaultTimerContext);

export const TimerProvider = ({ children }: PropsWithChildren<object>) => {
  const { curUser } = useUser();
  const [timerEnd, setTimerEnd] = useState<Date>();
  const [timerOpen, setTimerOpen] = useState(true);
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);

  useEffect(() => {
    if (curUser?._id) {
      getTimerEnd();
    }
  }, [curUser]);

  const getTimerEnd = async () => {
    const res = await api.get(`${TIMER_API_URL}/${curUser?._id}`);
    const result: { timerEnd: Date } = res.data;
    if (result) setTimerEnd(result.timerEnd);
  };

  const setTimer = async (timerEnd: Date | undefined) => {
    await api.put(`${TIMER_API_URL}/${curUser?._id}`, timerEnd);
    setTimerEnd(timerEnd);
  };

  const unsetTimer = async () => {
    await api.delete(`${TIMER_API_URL}/${curUser?._id}`);
    setTimerEnd(undefined);
  };

  return (
    <TimerContext.Provider
      value={{
        timerEnd,
        setTimer,
        unsetTimer,
        timerOpen,
        setTimerOpen,
        timerDialogOpen,
        setTimerDialogOpen,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
