import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { SizeInfo } from "@/lib/types";

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
  const [overlayOn, setOverlayOn] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [innerSize, setInnerSize] = useState<SizeInfo>({
    width: undefined,
    height: undefined,
  });

  const updateSize = () => {
    setInnerSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined")
      setInnerSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    window.addEventListener("resize", updateSize);
  }, []);

  const toggleScreenState = (state: "overlay" | "fetching", value: boolean) =>
    state === "overlay" ? setOverlayOn(value) : setIsFetching(value);

  return (
    <ScreenStateContext
      value={{
        innerWidth: innerSize.width,
        innerHeight: innerSize.height,
        overlayOn,
        isFetching,
        toggleScreenState,
      }}
    >
      {children}
    </ScreenStateContext>
  );
};

export const useScreenState = () => useContext(ScreenStateContext);
