import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { Animated, Easing } from "react-native";
import { env } from "../../../config/env";

export const PULSE_PERIOD = 2000;

const PulseContext = createContext<Animated.Value | null>(null);

export const PulseProvider = ({ children }: { children: ReactNode }) => {
  const phase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (env.e2e) return;
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
  }, [phase]);

  return (
    <PulseContext.Provider value={phase}>{children}</PulseContext.Provider>
  );
};

export const usePulse = (): Animated.Value => {
  const phase = useContext(PulseContext);
  const fallback = useRef(new Animated.Value(0)).current;
  return phase ?? fallback;
};
