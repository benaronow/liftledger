import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ColorPalette,
  DARK_COLORS,
  LIGHT_COLORS,
} from "@liftledger/shared";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  colors: ColorPalette;
  /** The currently rendered scheme ("light" or "dark") */
  scheme: "light" | "dark";
  /** The stored user preference */
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
}

const STORAGE_KEY = "@liftledger/theme";

const ThemeContext = createContext<ThemeContextValue>({
  colors: DARK_COLORS,
  scheme: "dark",
  preference: "system",
  setPreference: () => undefined,
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const rawScheme = useColorScheme();
  const systemScheme: "light" | "dark" =
    rawScheme === "light" || rawScheme === "dark" ? rawScheme : "dark";
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  // Load stored preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setPreferenceState(stored);
      }
    });
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref);
  }, []);

  const scheme = preference === "system" ? systemScheme : preference;
  const colors = scheme === "light" ? LIGHT_COLORS : DARK_COLORS;

  return (
    <ThemeContext.Provider value={{ colors, scheme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
