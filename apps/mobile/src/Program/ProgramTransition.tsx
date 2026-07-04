import { createContext, useContext } from "react";

interface ProgramTransitionModel {
  transitioning: boolean;
  setTransitioning: (transitioning: boolean) => void;
}

const ProgramTransitionContext = createContext<ProgramTransitionModel>({
  transitioning: false,
  setTransitioning: () => {},
});

export const ProgramTransitionProvider = ProgramTransitionContext.Provider;

export const useProgramTransition = () => useContext(ProgramTransitionContext);
