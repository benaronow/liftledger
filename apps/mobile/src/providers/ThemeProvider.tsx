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

interface ThemePreferenceValue {
  scheme: "light" | "dark";
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
    <ThemePreferenceContext.Provider
      value={{ scheme, preference, setPreference }}
    >
      <PaperProvider
        theme={theme}
        settings={{
          icon: (props) => <MaterialCommunityIcons {...props} />,
        }}
      >
        {children}
      </PaperProvider>
    </ThemePreferenceContext.Provider>
  );
};

export const useThemePreference = () => useContext(ThemePreferenceContext);
