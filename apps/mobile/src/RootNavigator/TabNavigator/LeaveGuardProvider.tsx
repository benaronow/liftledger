import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

type LeaveHandler = (proceed: () => void) => boolean;

interface LeaveGuardValue {
  registerGuard: (route: string, handler: LeaveHandler | null) => void;
  requestLeave: (fromRoute: string, proceed: () => void) => boolean;
}

const LeaveGuardContext = createContext<LeaveGuardValue>({
  registerGuard: () => {},
  requestLeave: () => false,
});

export const LeaveGuardProvider = ({ children }: PropsWithChildren) => {
  const guards = useRef<Record<string, LeaveHandler>>({});

  const registerGuard = useCallback(
    (route: string, handler: LeaveHandler | null) => {
      if (handler) guards.current[route] = handler;
      else delete guards.current[route];
    },
    [],
  );

  const requestLeave = useCallback((fromRoute: string, proceed: () => void) => {
    const handler = guards.current[fromRoute];
    return handler ? handler(proceed) : false;
  }, []);

  const value = useMemo(
    () => ({ registerGuard, requestLeave }),
    [registerGuard, requestLeave],
  );

  return (
    <LeaveGuardContext.Provider value={value}>
      {children}
    </LeaveGuardContext.Provider>
  );
};

export const useLeaveGuard = () => useContext(LeaveGuardContext);
