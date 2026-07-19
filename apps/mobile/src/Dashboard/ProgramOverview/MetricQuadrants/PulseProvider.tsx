import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Animated, AppState, Easing } from "react-native";
import { env } from "../../../config/env";

export const PULSE_PERIOD = 2000;

export const useAppActive = () => {
  const [active, setActive] = useState(
    () => AppState.currentState === "active",
  );
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) =>
      setActive(next === "active"),
    );
    return () => sub.remove();
  }, []);
  return active;
};

const PulseContext = createContext<Animated.Value | null>(null);

export const PulseProvider = ({ children }: { children: ReactNode }) => {
  const phase = useRef(new Animated.Value(0)).current;
  const appActive = useAppActive();

  useEffect(() => {
    if (env.e2e || !appActive) return;
    const loop = Animated.loop(
      Animated.timing(phase, {
        toValue: 1,
        duration: PULSE_PERIOD,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [phase, appActive]);

  return (
    <PulseContext.Provider value={phase}>{children}</PulseContext.Provider>
  );
};

export const usePulse = (): Animated.Value => {
  const phase = useContext(PulseContext);
  const fallback = useRef(new Animated.Value(0)).current;
  return phase ?? fallback;
};
