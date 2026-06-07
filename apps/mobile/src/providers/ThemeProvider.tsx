import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import { AppDarkTheme, AppLightTheme } from "../paperTheme";

export type ThemePreference = "light" | "dark" | "system";

// Color access app-wide goes through Paper's `useTheme()`. This context only
// owns what Paper doesn't: the user's light/dark/system preference (persisted)
// and the resolved scheme, which decides which Paper theme to provide.
interface ThemePreferenceValue {
  /** The currently rendered scheme ("light" or "dark") */
  scheme: "light" | "dark";
  /** The stored user preference */
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
}

const STORAGE_KEY = "@liftledger/theme";

const ThemePreferenceContext = createContext<ThemePreferenceValue>({
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
  const theme = scheme === "light" ? AppLightTheme : AppDarkTheme;

  return (
    <ThemePreferenceContext.Provider value={{ scheme, preference, setPreference }}>
      <PaperProvider
        theme={theme}
        settings={{
          // Paper's default icon set is MaterialCommunityIcons; source it from
          // @expo/vector-icons so Expo bundles the font.
          icon: (props) => <MaterialCommunityIcons {...props} />,
        }}
      >
        {children}
      </PaperProvider>
    </ThemePreferenceContext.Provider>
  );
};

export const useThemePreference = () => useContext(ThemePreferenceContext);
