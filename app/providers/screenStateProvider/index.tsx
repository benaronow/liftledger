import { createContext, ReactNode, useContext, useState } from "react";
import { useInnerSize } from "./useInnerSize";

type StateType = "overlay" | "fetching";

interface ScreenStateContextType {
  innerWidth: number | undefined;
  innerHeight: number | undefined;
  overlayOn: boolean;
  isFetching: boolean;
  toggleScreenState: (state: StateType, value: boolean) => void;
}

const defaultScreenStateContext: ScreenStateContextType = {
  innerWidth: undefined,
  innerHeight: undefined,
  overlayOn: false,
  isFetching: false,
  toggleScreenState: () => {},
};

export const ScreenStateContext = createContext(defaultScreenStateContext);

interface ScreenStateProviderProps {
  readonly children: ReactNode;
}

export const ScreenStateProvider = ({ children }: ScreenStateProviderProps) => {
  const { innerWidth, innerHeight } = useInnerSize();
  const [overlayOn, setOverlayOn] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const toggleScreenState = (state: "overlay" | "fetching", value: boolean) =>
    state === "overlay" ? setOverlayOn(value) : setIsFetching(value);

  return (
    <ScreenStateContext
      value={{
        innerWidth,
        innerHeight,
        overlayOn,
        isFetching,
        toggleScreenState,
      }}
    >
      {children}
    </ScreenStateContext>
  );
};

export const useTheme = () => useContext(ScreenStateContext);
