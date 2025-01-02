import { createContext, ReactNode, useContext } from "react";
import { useInnerSize } from "./useInnerSize";

interface InnerSizeContextType {
  innerWidth: number | undefined;
  innerHeight: number | undefined;
}

const defaultInnerSizeContext: InnerSizeContextType = {
  innerWidth: undefined,
  innerHeight: undefined,
};

export const InnerSizeContext = createContext(defaultInnerSizeContext);

interface InnerSizeProviderProps {
  readonly children: ReactNode;
}

export const InnerSizeProvider = ({ children }: InnerSizeProviderProps) => {
  const { innerWidth, innerHeight } = useInnerSize();

  return (
    <InnerSizeContext value={{ innerWidth, innerHeight }}>{children}</InnerSizeContext>
  );
};

export const useTheme = () => useContext(InnerSizeContext);
