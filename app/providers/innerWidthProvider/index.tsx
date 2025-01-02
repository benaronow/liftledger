import { createContext, ReactNode, useContext } from "react";
import { useInnerWidth } from "./useInnerWidth";

interface InnerWidthContextType {
  innerWidth: number | undefined;
}

const defaultInnerWidthContext: InnerWidthContextType = {
  innerWidth: undefined,
};

export const InnerWidthContext = createContext(defaultInnerWidthContext);

interface InnerWidthProviderProps {
  readonly children: ReactNode;
}

export const InnerWidthProvider = ({ children }: InnerWidthProviderProps) => {
  const { innerWidth } = useInnerWidth();

  return (
    <InnerWidthContext value={{ innerWidth }}>{children}</InnerWidthContext>
  );
};

export const useTheme = () => useContext(InnerWidthContext);
