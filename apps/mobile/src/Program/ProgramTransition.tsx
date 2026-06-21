import { createContext, useContext } from "react";

// Tracks whether the Program screen is mid-save/quit, so we can cover the editor
// with the LogoSpinner during the transition to the Dashboard. Lives ABOVE the
// keyed TemplateProvider (which remounts when curProgram changes on save), so the
// flag survives the remount that would otherwise expose the editor's new state.
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
